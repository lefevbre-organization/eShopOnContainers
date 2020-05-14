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

            //_client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //_clientOnline = _clientFactory.CreateClient();
            //var handlerOnline = new HttpClientHandler { };
            //handlerOnline.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
            //_clientOnline.BaseAddress = new Uri("https://herculesppd.lefebvre.es/webclient46/ws");

            //var authData = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"ws:22lcqsp11lsw"));

            //_clientOnline.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authData);
        }

        #region Review

        public async Task<Result<string>> FileGetAsync(EntitySearchById fileMail)
        {
            var result = new Result<string>(null);
            try
            {
                var lexonFile = new LexonGetFile
                {
                    idCompany = 449, //await GetIdCompany(fileMail.idUser, fileMail.bbdd),
                    idUser = fileMail.idUser,
                    idDocument = fileMail.idEntity ?? 0
                };

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);
                var url = $"{_settings.Value.CentinelaUrl}?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}";
                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _client.GetAsync(url))
                {
                    WriteError($"Se recibe contestación {DateTime.Now}");

                    if (response.IsSuccessStatusCode)
                    {
                        var arrayFile = await response.Content.ReadAsByteArrayAsync();
                        var stringFile = Convert.ToBase64String(arrayFile);
                        var fileName = response.Content.Headers.ContentDisposition.FileName;
                        result.data = stringFile;
                        TraceInfo(result.infos, $"Se recupera el fichero:  {fileName}", lexonFile.idDocument.ToString());
                    }
                    else
                    {
                        var responseText = await response.Content.ReadAsStringAsync();
                        TraceOutputMessage(result.errors, $"Response not ok : {responseText} with lexon-dev with code-> {(int)response.StatusCode} - {response.ReasonPhrase}", 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error al guardar el archivo {fileMail.idEntity}, -> {ex.Message}", "599");
            }

            WriteError($"Salimos de FileGetAsync a las {DateTime.Now}");
            return result;
        }

        public async Task<Result<bool>> FilePostAsync(MailFileView fileMail)
        {
            var result = new Result<bool>(false);
            try
            {
                var lexonFile = await GetFileDataByTypeActuation(fileMail);
                lexonFile.fileName = RemoveProblematicChars(lexonFile.fileName);
                var name = Path.GetFileNameWithoutExtension(lexonFile.fileName);

                name = string.Concat(name.Split(Path.GetInvalidFileNameChars()));
                name = string.Concat(name.Split(Path.GetInvalidPathChars()));
                var maxlenght = name.Length > 55 ? 55 : name.Length;
                lexonFile.fileName = $"{name.Substring(0, maxlenght)}{Path.GetExtension(lexonFile.fileName)}";

                var json = JsonConvert.SerializeObject(lexonFile);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                var dataparameters = Convert.ToBase64String(buffer);

                SerializeObjectToPut(fileMail.ContentFile, $"?option=com_lexon&task=hook.receive&type=repository&data={dataparameters}", out string url, out ByteArrayContent data);

                WriteError($"Se hace llamada a {url} a las {DateTime.Now}");
                using (var response = await _client.PutAsync(url, data))
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

        private async Task<LexonPostFile> GetFileDataByTypeActuation(MailFileView fileMail)
        {
            var lexonFile = new LexonPostFile
            {
                idCompany = 449, // await GetIdCompany(fileMail.idUser, fileMail.bbdd),
                fileName = fileMail.Name,
                idUser = fileMail.idUser,
                idEntityType = fileMail.idType ?? 0
            };
            if (fileMail.IdActuation == null || fileMail.IdActuation == 0)
            {
                lexonFile.idFolder = fileMail.IdParent ?? 0;
                lexonFile.idEntity = fileMail.idEntity ?? 0;
            }
            else
            {
                lexonFile.idFolder = 0;
                lexonFile.idEntity = (long)fileMail.IdActuation;
            };
            return lexonFile;
        }

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.CentinelaUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        private void SerializeObjectToPut(string textInBase64, string path, out string url, out ByteArrayContent byteArrayContent)
        {
            url = $"{_settings.Value.CentinelaUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            byte[] newBytes = Convert.FromBase64String(textInBase64);

            byteArrayContent = new ByteArrayContent(newBytes);
            byteArrayContent.Headers.ContentType = new MediaTypeHeaderValue("application/bson");
        }

        #endregion Review

        #region Centinela

        public Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile)
        {
            throw new NotImplementedException();
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

            //try
            //{
            //    var url = $"https://herculesppd.lefebvre.es/webclient46/ws/encriptarEntrada.do?nEntrada={idNavisionUser}";

            //    using (var response = await _clientOnline.GetAsync(url))
            //    {
            //        if (response.IsSuccessStatusCode)
            //        {
            //            var rawResult = await response.Content.ReadAsStringAsync();

            //            if (!string.IsNullOrEmpty(rawResult))
            //            {
            //                var resultado = (JsonConvert.DeserializeObject<OnlineEntrada>(rawResult));
            //                result.infos.Add(new Info() { code = "PRE_Online", message = resultado.ENTRADA_ENCRIPTADA });
            //            }
            //        }
            //        else
            //        {
            //            result.errors.Add(new ErrorInfo
            //            {
            //                code = "553",
            //                detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
            //            });
            //        }
            //    }
            //}
            //catch (Exception ex)
            //{
            //    result.errors.Add(new ErrorInfo
            //    {
            //        code = "554",
            //        detail = $"General error when call online service",
            //        message = ex.Message
            //    });
            //}
            //try
            //{
            //    var url = $"https://centinela-api.lefebvre.es/api/secure/conectamail/evaluations/user/{idNavisionUser}";

            //    using (var response = await _clientPro.GetAsync(url))
            //    {
            //        if (response.IsSuccessStatusCode)
            //        {
            //            var rawResult = await response.Content.ReadAsStringAsync();

            //            if (!string.IsNullOrEmpty(rawResult))
            //            {
            //                var resultado = (JsonConvert.DeserializeObject<CenEvaluation[]>(rawResult));
            //                resultado.ToList();
            //                result.infos.Add(new Info() { code = "PRO_Centinela", message = resultado?.ToList()?.Count.ToString() });
            //            }
            //        }
            //        else
            //        {
            //            result.errors.Add(new ErrorInfo
            //            {
            //                code = "553",
            //                detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
            //            });
            //        }
            //    }
            //}
            //catch (Exception ex)
            //{
            //    result.errors.Add(new ErrorInfo
            //    {
            //        code = "554",
            //        detail = $"General error when call online service",
            //        message = ex.Message
            //    });
            //}
            return result;
        }

        internal class OnlineEntrada
        {
            public string ENTRADA_ENCRIPTADA { get; set; }
            public long ID_ENTRADA { get; set; }
            public string N_ENTRADA { get; set; }
            //{"ID_ENTRADA":1037352,"N_ENTRADA":"E1621500"}
            // {"ENTRADA_ENCRIPTADA":"eHRncH9gaw%3D%3D"}
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

        public async Task<Result<bool>> FilePostAsync(ConceptFile file)
        {
            throw new NotImplementedException();
            // /document/conceptobject/CONCEPTOBJECT_ID?idEntrada=ID_EN
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

        #endregion Centinela
    }
}