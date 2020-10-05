﻿using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Services
{
    public class CentinelaService : BaseClass<CentinelaService>, ICentinelaService
    {
        public readonly ICentinelaRepository _centinelaRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _client;
        private readonly IOptions<CentinelaSettings> _settings;

        public CentinelaService(
                IOptions<CentinelaSettings> settings
                , ICentinelaRepository centinelaRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<CentinelaService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _centinelaRepository = centinelaRepository ?? throw new ArgumentNullException(nameof(centinelaRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            var uri = new Uri(_settings.Value.CentinelaUrl);
            var credentialsCache = new CredentialCache { { uri, "NTLM", new NetworkCredential(_settings.Value.CentinelaLogin, _settings.Value.CentinelaPassword) } };
            var handler = new HttpClientHandler { Credentials = credentialsCache };
            _client = new HttpClient(handler) { BaseAddress = uri, Timeout = new TimeSpan(0, 0, 10) };
        }

        public async Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile)
        {
            var result = new Result<string>(null);
            try
            {
                // "/api/secure/conectamail/documentobject/DOCUMENTOBJECT_ID/download?idEntrada=ID_ENTRADA";
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/documentobject/{idFile}/download?idEntrada={idNavisionUser}";
                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using var response = await _client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var arrayFile = await response.Content.ReadAsByteArrayAsync();
                    var stringFile = Convert.ToBase64String(arrayFile);
                    var fileName = response.Content.Headers.ContentDisposition.FileName;
                    result.data = stringFile;
                    TraceInfo(result.infos, $"Se recupera el fichero:  {fileName}", idFile);
                }
                else
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    TraceOutputMessage(result.errors, $"Response not ok when fileget with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al obtener el archivo {idFile}, -> {ex.Message}", ex.InnerException?.Message, "Centinela_GetFile_Error");
            }

            //WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");
            return result;
        }

        public async Task<Result<bool>> FilePostAsync(ConceptFile fileMail, string route)
        {
            var result = new Result<bool>(false);
            try
            {
                Console.WriteLine($"[{DateTime.Now}] START FilePostAsync");

                CleanNameFile(fileMail, out string name);

                SerializeToMultiPart(fileMail, name, route, out string url, out MultipartFormDataContent multipartContent);

                _client.Timeout = new TimeSpan(0, 0, 90);
                //WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                Console.WriteLine($"[{DateTime.Now}] Call to: {url}");
                using var response = await _client.PostAsync(url, multipartContent);
                Console.WriteLine($"[{DateTime.Now}] Response: {response.ToString()}");
                //WriteError($"Se recibe contestación {DateTime.Now}");
                _client.Timeout = new TimeSpan(0, 0, 10);

                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name} - {responseText} - {response.ReasonPhrase}");
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok : {responseText} when FilePost with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now}] Error: {ex.ToString()}");
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.Name}, -> {ex.Message} : {ex.InnerException}", ex.InnerException?.Message, "Centinela_Error_FilePost");
            }

            Console.WriteLine($"[{DateTime.Now}] END FilePostAsync");

            return result;
        }

       
        private void CleanNameFile(ConceptFile fileMail, out string cleanName)
        {
            fileMail.Name = RemoveProblematicChars(fileMail.Name);

            var name = Path.GetFileNameWithoutExtension(fileMail.Name);
            name = string.Concat(name.Split(Path.GetInvalidFileNameChars()));
            name = string.Concat(name.Split(Path.GetInvalidPathChars()));
            var maxlenght = name.Length > 250 ? 250 : name.Length;

            fileMail.Name = $"{name.Substring(0, maxlenght)}{Path.GetExtension(fileMail.Name)}";
            cleanName = name;
        }

        private void SerializeToMultiPart(ConceptFile fileMail, string name, string route,  out string url, out MultipartFormDataContent multipartContent)
        {
            // https://stackoverflow.com/questions/42212406/how-to-send-a-file-and-form-data-with-httpclient-in-c-sharp/42212590
            url = getUrlCentinela(fileMail, route);
            
            TraceLog(parameters: new string[] { $"url={url}" });

            byte[] newBytes = Convert.FromBase64String(fileMail.ContentFile);
            var byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
            byteArrayContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = fileMail.Name,
                FileName = fileMail.Name
            };

            multipartContent = new MultipartFormDataContent() { { byteArrayContent } };
        }

        private string getUrlCentinela(ConceptFile fileMail, string route)
        {
            var url = "";
            switch (route)
            {
                case "/api/v1/Centinela/signatures/files/post":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadsigneddocument/{fileMail.ConceptId}";
                    break;
                case "/api/v1/Centinela/signatures/audit/post":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadsignaudit/{fileMail.ConceptId}";
                    break;
                default:
                    url = $"{_settings.Value.CentinelaUrl}/conectamail/document/conceptobject/{fileMail.ConceptId}?idEntrada={fileMail.idNavision}";
                    break;
            }
            return url;
        }

  
        public async Task<Result<CenUser>> GetUserAsync(string idNavisionUser)
        {
            var result = new Result<CenUser>(new CenUser());
            result.data.idNavision = idNavisionUser;
            result.data.version = 1;
            result.data.name = "Nombre de usuario";
            var resultEvaluations = await GetEvaluationsAsync(idNavisionUser);
            result.data.evaluations = resultEvaluations.data.ToArray();

            result.errors = resultEvaluations.errors;
            result.infos = resultEvaluations.infos;

            return result;
        }

        public async Task<Result<CenEvaluation>> GetEvaluationByIdAsync(string idNavisionUser, int idEvaluation)
        {
            var result = new Result<CenEvaluation>(new CenEvaluation());
            var resultEvaluations = await GetEvaluationsAsync(idNavisionUser);

            result.errors = resultEvaluations.errors;
            result.infos = resultEvaluations.infos;
            var evaluacion = resultEvaluations.data.Where(eva => eva.evaluationId == idEvaluation).ToList().FirstOrDefault();
            result.data = evaluacion;

            return result;
        }

        public async Task<Result<List<CenEvaluation>>> GetEvaluationsAsync(string idNavisionUser)
        {
            var result = new Result<List<CenEvaluation>>(new List<CenEvaluation>());
            try
            {
                //https://compliance-api.affin.es/api/secure/conectamail/evaluations/user/E1621396
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/evaluations/user/{idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<CenEvaluation[]>(responseText));
                        result.data = resultado.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error GetEvaluations, -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetEvaluations");
            }

            return result;
        }

        public async Task<Result<List<CenContact>>> GetContactsAsync(string idNavisionUser)
        {
            var result = new Result<List<CenContact>>(new List<CenContact>());
            try
            {
                // https://compliance-api.affin.es/api/secure/conectamail/user/contacts/E1654176
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/user/contacts/{idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<CenContact[]>(responseText));
                        result.data = resultado?.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error GetContacts, -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetContacts");
            }

            return result;
        }

        public async Task<Result<List<CenDocument>>> GetDocumentsAsync(string idNavisionUser, string search)
        {
            var result = new Result<List<CenDocument>>(new List<CenDocument>());
            try
            {
                // /api/secure/conectamail/search/documents?text=TEXTO&IdEntrada=ID_ENTRADA
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/search/documents?text={search}&IdEntrada={idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<ListaDocumentos>(responseText));
                        result.data = resultado?.Documents?.Results?.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetDocuments");
            }

            return result;
        }

        public async Task<Result<List<CenEvaluationTree>>> GetEvaluationTreeByIdAsync(string idNavisionUser, int idEvaluation)
        {
            var result = new Result<List<CenEvaluationTree>>(new List<CenEvaluationTree>());
            try
            {
                // /api/secure/conectamail/tree/evaluation/EVALUATION_ID?IdEntrada=ID_ENTRADA
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/tree/evaluation/{idEvaluation}?IdEntrada={idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<CenEvaluationTree[]>(responseText));
                        result.data = resultado.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetEvaluationTree");
            }

            return result;
        }

        public async Task<Result<List<CenConceptInstance>>> GetConceptsByTypeAsync(string idNavisionUser, int idConcept)
        {
            var result = new Result<List<CenConceptInstance>>(new List<CenConceptInstance>());
            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/conceptobjects/concept/{idConcept}?IdEntrada={idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<CenConceptInstance[]>(responseText));
                        result.data = resultado.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetConceptsByType");
            }

            return result;
        }

        public async Task<Result<List<CenDocumentObject>>> GetDocumentsByInstanceAsync(string idNavisionUser, string conceptObjectId)
        {
            var result = new Result<List<CenDocumentObject>>(new List<CenDocumentObject>());
            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/documentobjects/conceptobject/{conceptObjectId}?IdEntrada={idNavisionUser}";

                using var response = await _client.GetAsync(url);
                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    if (!string.IsNullOrEmpty(responseText))
                    {
                        var resultado = (JsonConvert.DeserializeObject<ListaDocumentObjects>(responseText));
                        result.data = resultado?.Documents.ToList();
                    }
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error -> {ex.Message}", ex.InnerException?.Message, "Centinela_Error_GetDocumentsByInstance");
            }

            return result;
        }

        public async Task<Result<bool>> CancelSignatureAsync(string guid)
        {
            var result = new Result<bool>(false);
            try
            {
                Console.WriteLine($"[{DateTime.Now}] START CancelSignatureAsync");

                var url = $"{_settings.Value.CentinelaUrl}/sign/signcancelled/{guid}";

                Console.WriteLine($"[{DateTime.Now}] Call to: {url}");
                
                HttpContent httpContent = new StringContent("", Encoding.UTF8, "application/json-patch+json");

                using var response = await _client.PatchAsync(url, httpContent);

                Console.WriteLine($"[{DateTime.Now}] Response: {response.ToString()}");

                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se cancela la firma {guid} - {responseText}");
                }
                else
                {
                    TraceOutputMessage(result.errors, $"Response not ok : {responseText} when CancelSignature with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", responseText, "Centinela_Error_StatusCode");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now}] Error: {ex.ToString()}");
                TraceOutputMessage(result.errors, $"Error al cancelar la firma {guid}, -> {ex.Message} : {ex.InnerException}", ex.InnerException?.Message, "Centinela_Error_FilePost");
            }

            Console.WriteLine($"[{DateTime.Now}]  END CancelSignatureAsync");

            return result;
        }

    }
}