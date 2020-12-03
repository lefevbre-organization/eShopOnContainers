using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Exceptions;
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
            _client = new HttpClient(handler) { BaseAddress = uri, Timeout = new TimeSpan(0, 0, 60) };
        }

        public async Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile)
        {
            var result = new Result<string>(null);
            var ticks = DateTime.Now.Ticks;

            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/documentobject/{idFile}/download?idEntrada={idNavisionUser}";
                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using var response = await _client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var arrayFile = await response.Content.ReadAsByteArrayAsync();
                    var stringFile = Convert.ToBase64String(arrayFile);
                    var fileName = response.Content.Headers.ContentDisposition.FileName;
                    result.data = stringFile;
                    var tiksResponse = DateTime.Now.Ticks - ticks;

                    TraceInfo(result.infos, $"Resupera fichero: {fileName} - id:{idFile} - tiempo:{tiksResponse}", Codes.Centinela.GetFile);
                }
                else
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok when fileget with code-> { (int)response.StatusCode } - { response.ReasonPhrase}"),
                               Codes.Centinela.GetFile,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CentinelaDomainException($"Error when fileget {idFile}", ex), Codes.Centinela.GetFile, Codes.Areas.Centinela);
            }

            return result;
        }

        public async Task<Result<bool>> FilePostAsync(ConceptFile fileMail, string route)
        {
            var result = new Result<bool>(false);
            var ticks = DateTime.Now.Ticks;
            try
            {
                TraceInfo(result.infos, $"Se inicia petición PostFile {DateTime.Now}", Codes.Centinela.PostFile);

                CleanNameFile(fileMail, out string name);

                SerializeToMultiPart(fileMail, name, route, out string url, out MultipartFormDataContent multipartContent);

                using var response = await _client.PostAsync(url, multipartContent);
                var tiksResponse = DateTime.Now.Ticks - ticks;
                //Console.WriteLine($"[{DateTime.Now}] Response: {response}");
                TraceInfo(result.infos, $"Finaliza petición PostFile con duración {tiksResponse}", Codes.Centinela.PostFile);

                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se guarda el fichero {fileMail.Name} - {responseText} - {response.ReasonPhrase}", Codes.Centinela.PostFile);
                }
                else
                {
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) when filePost with code-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.PostFile,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CentinelaDomainException($"Error when filePost {fileMail.Name}", ex), Codes.Centinela.PostFile, Codes.Areas.Centinela);
            }

            return result;
        }

        public async Task<Result<bool>> CertificationPostAsync(CertificationFile file, string route = "")
        {
            var result = new Result<bool>(false);
            var ticks = DateTime.Now.Ticks;
            var url = GetUrlCertificationCentinela(file, route);

            try
            {
                TraceInfo(result.infos, $"Se inicia petición CertificationPost {DateTime.Now}", Codes.Centinela.CertificationPost);

                CleanNameFile(file, out string name);

                SerializeToMultiPart(file, out MultipartFormDataContent content);
                
                using var response = await _client.PostAsync(url, content);
                var tiksResponse = DateTime.Now.Ticks - ticks;
                //Console.WriteLine($"[{DateTime.Now}] Response: {response}");
                TraceInfo(result.infos, $"Finaliza petición PostFile con duración {tiksResponse}", Codes.Centinela.CertificationPost);

                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se guarda el fichero {file.Name} - {responseText} - {response.ReasonPhrase}", Codes.Centinela.CertificationPost);
                }
                else
                {
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) when filePost with code-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.CertificationPost,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CentinelaDomainException($"Error when filePost {file.Name}", ex), Codes.Centinela.CertificationPost, Codes.Areas.Centinela);
            }

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

        private void CleanNameFile(CertificationFile fileMail, out string cleanName)
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
            url = GetUrlCentinela(fileMail, route);
            
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

        private void SerializeToMultiPart(CertificationFile file, out MultipartFormDataContent multipartContent)
        {
            multipartContent = new MultipartFormDataContent();
            var jsonParams = new
                {
                    Name = file.recipient.Name ?? "",
                    Email = file.recipient.Email ?? "",
                    Phone = file.recipient.Phone ?? ""
                };
            multipartContent.Add(new StringContent(JsonConvert.SerializeObject(jsonParams), Encoding.UTF8, "application/json"));

            byte[] newBytes = Convert.FromBase64String(file.ContentFile);
            var byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
            byteArrayContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = file.Name,
                FileName = file.Name
            };

            multipartContent.Add(byteArrayContent);
        }

        private string GetUrlCentinela(ConceptFile fileMail, string route)
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
                case "/api/v1/Centinela/signatures/audit/post/certification/email":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadcertifiedemailaudit/{fileMail.ConceptId}";
                    break;
                case "/api/v1/Centinela/signatures/audit/post/certification/sms":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadcertifiedsmsaudit/{fileMail.ConceptId}";
                    break;
                default:
                    url = $"{_settings.Value.CentinelaUrl}/conectamail/document/conceptobject/{fileMail.ConceptId}?idEntrada={fileMail.idNavision}";
                    break;
            }
            return url;
        }

        private string GetUrlCertificationCentinela(CertificationFile certificationFile, string route)
        {
            var url = "";
            switch (route)
            {
                case "/api/v1/Centinela/signatures/audit/post/certification/email":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadcertifiedemailaudit/{certificationFile.Guid}/{certificationFile.DocumentId}";
                    break;
                case "/api/v1/Centinela/signatures/audit/post/certification/sms":
                    url = $"{_settings.Value.CentinelaUrl}/sign/uploadcertifiedsmsaudit/{certificationFile.Guid}/{certificationFile.DocumentId}";
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
            AddResultTrace(resultEvaluations, result);
            result.data.evaluations = resultEvaluations.data.ToArray();

            return result;
        }

        public async Task<Result<CenEvaluation>> GetEvaluationByIdAsync(string idNavisionUser, int idEvaluation)
        {
            var result = new Result<CenEvaluation>(new CenEvaluation());
            var resultEvaluations = await GetEvaluationsAsync(idNavisionUser);
            AddResultTrace(resultEvaluations, result);
            var evaluacion = resultEvaluations.data.Where(eva => eva.evaluationId == idEvaluation).ToList().FirstOrDefault();
            result.data = evaluacion;

            return result;
        }

        public async Task<Result<List<CenEvaluation>>> GetEvaluationsAsync(string idNavisionUser)
        {
            var result = new Result<List<CenEvaluation>>(new List<CenEvaluation>());
            try
            {
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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get evaluations-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetEvaluations,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when Get evaluations {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetEvaluations,
                           Codes.Areas.Centinela);
            }

            return result;
        }

        public async Task<Result<List<CenContact>>> GetContactsAsync(string idNavisionUser)
        {
            var result = new Result<List<CenContact>>(new List<CenContact>());
            try
            {
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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get contacts-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetContacts,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when get contacts {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetContacts,
                           Codes.Areas.Centinela);
            }

            return result;
        }

        public async Task<Result<List<CenDocument>>> GetDocumentsAsync(string idNavisionUser, string search)
        {
            var result = new Result<List<CenDocument>>(new List<CenDocument>());
            var ticks = DateTime.Now.Ticks;

            try
            {
                var url = $"{_settings.Value.CentinelaUrl}/conectamail/search/documents?text={search}&IdEntrada={idNavisionUser}";
                var msg = $"START {nameof(GetDocumentsAsync)} - [{DateTime.Now}] Call to: {url}";
                TraceInfo(result.infos, msg, Codes.Centinela.GetDocuments);

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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get documents-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetContacts,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when get documents {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetContacts,
                           Codes.Areas.Centinela);
            }
            var tiksResponse = DateTime.Now.Ticks - ticks;
            var msgEnd = $"END {nameof(GetDocumentsAsync)} - Duration:[{tiksResponse}]";
            TraceInfo(result.infos, msgEnd, Codes.Centinela.GetDocuments);
            return result;
        }

        public async Task<Result<List<CenEvaluationTree>>> GetEvaluationTreeByIdAsync(string idNavisionUser, int idEvaluation)
        {
            var result = new Result<List<CenEvaluationTree>>(new List<CenEvaluationTree>());
            try
            {
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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get evaluations tree-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetEvaluationTree,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when get evaluations tree {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetEvaluationTree,
                           Codes.Areas.Centinela);
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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get concepts-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetConcepts,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when get concepts {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetConcepts,
                           Codes.Areas.Centinela);
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
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when get documents by instance-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.GetDocInstance,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when get documents by instance {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.GetDocInstance,
                           Codes.Areas.Centinela);
            }

            return result;
        }

        public async Task<Result<bool>> CancelSignatureAsync(string guid)
        {
            var result = new Result<bool>(false);
            var ticks = DateTime.Now.Ticks;
            try
            {

                var url = $"{_settings.Value.CentinelaUrl}/sign/signcancelled/{guid}";
                var msg = $"START {nameof(CancelSignatureAsync)} - [{DateTime.Now}] Call to: {url}";
                Console.WriteLine(msg);
                TraceInfo(result.infos, msg, Codes.Centinela.CancelSignature);

                HttpContent httpContent = new StringContent("", Encoding.UTF8, "application/json-patch+json");
                using var response = await _client.PatchAsync(url, httpContent);
                //Console.WriteLine($"[{DateTime.Now}] Response: {response}");
                var responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se cancela la firma {guid} - {responseText}", Codes.Centinela.CancelSignature);
                }
                else
                {
                    TraceError(result.errors,
                               new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when CancelSignature-> { (int)response.StatusCode } - { response.ReasonPhrase} "),
                               Codes.Centinela.CancelSignature,
                               Codes.Areas.Centinela);
                }
            }
            catch (Exception ex)
            {
                //Console.WriteLine($"[{DateTime.Now}] Error: {ex.ToString()}");
                TraceError(result.errors,
                           new CentinelaDomainException($"Error when CncelSignature {_settings.Value.CentinelaUrl}", ex),
                           Codes.Centinela.CancelSignature,
                           Codes.Areas.Centinela);
            }

            var tiksResponse = DateTime.Now.Ticks - ticks;
            var msgEnd = $"END {nameof(CancelSignatureAsync)} - Duration:[{tiksResponse}]";
            TraceInfo(result.infos, msgEnd, Codes.Centinela.CancelSignature);
            Console.WriteLine(msgEnd);

            return result;
        }

        public async Task<Result<bool>> NotifySignatureAsync(string service, string guid, string documentId, List<CenRecipient> recipients)
        {
            var result = new Result<bool>(false);
            try
            {
                Console.WriteLine($"[{DateTime.Now}] START NotifySignatureAsync");

                var url = $"{_settings.Value.CentinelaUrl}/sign/beginprocess/{service}/{documentId}/{guid}";

                Console.WriteLine($"[{DateTime.Now}] Call to: {url}");

                HttpContent httpContent = new StringContent(JsonConvert.SerializeObject(recipients), Encoding.UTF8, "application/json");

                using var response = await _client.PostAsync(url, httpContent);

                Console.WriteLine($"[{DateTime.Now}] Response: {response.ToString()}");

                var responseText = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Se notifica la creación de una nueva petición Service:{service} -- GUID:{guid} -- DocId: {documentId}  --  {responseText}", "CE10");
                }
                else
                {
                    TraceError(result.errors, new CentinelaDomainException($"Response not ok: ({responseText}) from {url} when NotifySignature-> { (int)response.StatusCode } - { response.ReasonPhrase} "), "CE10", "CENTINELASVC");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{DateTime.Now}] Error: {ex.ToString()}");
                TraceError(result.errors, new CentinelaDomainException($"Error when NotifySignature {_settings.Value.CentinelaUrl}", ex), "CE10", "CENTINELASVC");
            }

            Console.WriteLine($"[{DateTime.Now}]  END NotifySignatureAsync");

            return result;
        }

    }
}