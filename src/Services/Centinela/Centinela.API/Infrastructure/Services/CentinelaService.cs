using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Repositories;
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
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Services
{
    public class CentinelaService : BaseClass<CentinelaService>, ICentinelaService
    {
        public readonly ICentinelaRepository _centinelaRepository;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _client;
        private readonly HttpClient _clientPro;
        private readonly HttpClient _clientOnline;
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

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            //_client = _clientFactory.CreateClient();

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
                var url = $"{_settings.Value.CentinelaUrl}/documentobject/{idFile}/download?idEntrada={idNavisionUser}";
                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _client.GetAsync(url))
                {
                  //  WriteError($"Se recibe contestación {DateTime.Now}");

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
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with centinela with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al obtener el archivo {idFile}, -> {ex.Message}", "CentinelaGetDocumentError");
            }

            WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");
            return result;
        }
      

        public async Task<Result<bool>> FilePostAsync(ConceptFile fileMail)
        {
            var result = new Result<bool>(false);
            try
            {
                CleanNameFile(fileMail, out string name);

                SerializeToMultiPart(fileMail, name, out string url, out MultipartFormDataContent multipartContent);

                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _client.PostAsync(url, multipartContent))
                {
                    WriteError($"Se recibe contestación {DateTime.Now}");

                    var responseText = await response.Content.ReadAsStringAsync();
                    if (response.IsSuccessStatusCode)
                    {
                        result.data = true;
                        TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name} - {responseText}");
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                //TraceMessage(result.errors, ex);
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.Name}, -> {ex.Message}", "598");
            }
            WriteError($"Salimos de FilePostAsync a las {DateTime.Now}");

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

        private void SerializeToMultiPart(ConceptFile fileMail, string name, out string url, out MultipartFormDataContent multipartContent)
        {
            // https://stackoverflow.com/questions/42212406/how-to-send-a-file-and-form-data-with-httpclient-in-c-sharp/42212590
            // _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var contentDispositionHeader = new ContentDisposition()
            {
                FileName = fileMail.Name,
                DispositionType = "attachment"
            };
            var path = $"/document/conceptobject/{fileMail.ConceptId}?idEntrada={fileMail.idNavision}";
            url = $"{_settings.Value.CentinelaUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });

            byte[] newBytes = Convert.FromBase64String(fileMail.ContentFile);
            var byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
            byteArrayContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = fileMail.Name,
                FileName = fileMail.Name
            };

            multipartContent = new MultipartFormDataContent()
                {
                 //{byteArrayContent, name, fileMail.Name}
                {byteArrayContent }
                };
 
        }

        #region Centinela

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
                var url = $"{_settings.Value.CentinelaUrl}/evaluations/user/{idNavisionUser}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<CenEvaluation[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Centinela_Error_SuccesStatusCode",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase} -> {_settings.Value.CentinelaPassword}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                var traceEx = ex.StackTrace ?? "";
                var messageEx = ex.InnerException?.Message ?? "";
                result.errors.Add(new ErrorInfo
                {
                    code = "Centinela_Error",
                    detail = $"General error when call centinela service",
                    message = $"{ex.Message} =  {messageEx} ({traceEx}) -> {_settings.Value.CentinelaPassword}"
                });
            }

            return result;
        }


        public async Task<Result<List<CenDocument>>> GetDocumentsAsync(string idNavisionUser, string search)
        {
            var result = new Result<List<CenDocument>>(new List<CenDocument>());
            try
            {
                // /api/secure/conectamail/search/documents?text=TEXTO&IdEntrada=ID_ENTRADA
                var url = $"{_settings.Value.CentinelaUrl}/search/documents?text={search}&IdEntrada={idNavisionUser}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ListaDocumentos>(rawResult));
                            result.data = resultado?.Documents?.Results?.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "593",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "594",
                    detail = $"General error when call centinela service",
                    message = ex.Message
                });
            }

            return result;
        }


        public async Task<Result<List<CenEvaluationTree>>> GetEvaluationTreeByIdAsync(string idNavisionUser, int idEvaluation)
        {
            var result = new Result<List<CenEvaluationTree>>(new List<CenEvaluationTree>());
            try
            {
                // /api/secure/conectamail/tree/evaluation/EVALUATION_ID?IdEntrada=ID_ENTRADA

                var url = $"{_settings.Value.CentinelaUrl}/tree/evaluation/{idEvaluation}?IdEntrada={idNavisionUser}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<CenEvaluationTree[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "593",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "594",
                    detail = $"General error when call centinela service",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<List<CenConceptInstance>>> GetConceptsByTypeAsync(string idNavisionUser, int idConcept)
        {
            var result = new Result<List<CenConceptInstance>>(new List<CenConceptInstance>());
            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/conceptobjects/concept/{idConcept}?IdEntrada={idNavisionUser}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<CenConceptInstance[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "593",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "594",
                    detail = $"General error when call centinela service",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<List<CenDocumentObject>>> GetDocumentsByInstanceAsync(string idNavisionUser, string conceptObjectId)
        {
            var result = new Result<List<CenDocumentObject>>(new List<CenDocumentObject>());
            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/documentobjects/conceptobject/{conceptObjectId}?IdEntrada={idNavisionUser}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ListaDocumentObjects>(rawResult));
                            result.data = resultado?.Documents.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "593",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "594",
                    detail = $"General error when call centinela service",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<List<LexContact>>> GetAllContactsAsync(string idNavisionUser, string idClient)
        {
            var result = new Result<List<LexContact>>(new List<LexContact>());
            try
            {
                //https://compliance-api.affin.es/api/secure/contacts/user/E1621396
                var url = $"{_settings.Value.CentinelaUrl}/contacts/user/{idNavisionUser}/client/{idClient}";

                using (var response = await _client.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<LexContact[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Centinela_Error_GetContactsCode",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                var traceEx = ex.StackTrace ?? "";
                var messageEx = ex.InnerException?.Message ?? "";
                result.errors.Add(new ErrorInfo
                {
                    code = "Centinela_GetContacts_Error",
                    detail = $"General error when call centinela service",
                    message = $"{ex.Message} =  {messageEx} ({traceEx})"
                });
            }

            return result;
        }

        #endregion Centinela
    }
}