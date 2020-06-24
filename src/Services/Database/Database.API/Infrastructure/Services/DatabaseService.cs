using Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Database.API.Models;
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

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Services
{
    public class DatabaseService : BaseClass<DatabaseService>, IDatabaseService
    {
        public readonly IDatabaseRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientOnline;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<DatabaseSettings> _settings;

        public DatabaseService(
                IOptions<DatabaseSettings> settings
                , IDatabaseRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<DatabaseService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repo = databaseRepository ?? throw new ArgumentNullException(nameof(databaseRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _clientOnline = _clientFactory.CreateClient();
            _clientOnline.BaseAddress = new Uri(_settings.Value.OnlineUrl);

            _clientOnline = _clientFactory.CreateClient();
            _clientOnline.BaseAddress = new Uri(_settings.Value.OnlineUrl);

            var authData = Convert.ToBase64String(
                Encoding.ASCII.GetBytes($"{_settings.Value.OnlineLogin}:{_settings.Value.OnlinePassword}"));

            _clientOnline.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authData);
            _clientOnline.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3");

            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");

        }


        public async Task<Result<string>> GetSesionAsync(string idNavisionUser)
        {
            var encodeUser = await GetEncodeUserAsync(idNavisionUser);
            {
                var result = new Result<string>(null);
                try
                {
                    //https://herculesppd.lefebvre.es/webclient46/google/crearSesion.do?ei=eHZqcHllZQ%3D%3D
                    var url = $"{_settings.Value.OnlineUrl}/google/crearSesion.do?ei={encodeUser?.data}";

                    using (var response = await _clientOnline.GetAsync(url))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var rawResult = await response.Content.ReadAsStringAsync();

                            if (!string.IsNullOrEmpty(rawResult))
                            {
                                var resultado = (JsonConvert.DeserializeObject<OnlineSesion>(rawResult));
                                result.data = resultado.JSESSIONID;
                            }
                        }
                        else
                        {
                            result.errors.Add(new ErrorInfo
                            {
                                code = "Error_Get_Session",
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
                        detail = $"General error when call Online Service",
                        message = ex.Message
                    });
                }

                return result;
            }
        }

        public async Task<Result<string>> GetEncodeUserAsync(string idNavisionUser)
        {
            var result = new Result<string>(string.Empty);
            try
            {
                //https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=E1654569
                var url = $"{_settings.Value.OnlineUrl}/ws/encriptarEntrada.do?nEntrada={idNavisionUser}";

                using (var response = await _clientOnline.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<OnlineEntrada>(rawResult));
                            result.data = resultado.ENTRADA_ENCRIPTADA;
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Error_EncodeUser_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_EncodeUser",
                    detail = $"General error when call online service",
                    message = ex.Message
                });
            }

            return result;
        }
        public async Task<Result<List<Document>>> GetDocumentsAsync(string sesion, string search, string indice, int start, int max)
        {
            var result = new Result<List<Document>>(new List<Document>());
            try
            {
                //https://herculesppd.lefebvre.es/webclient46/google/buscar.do?indice=...&fulltext=...&jsessionid=...&startat=...&maxresults=
                var url = $"{_settings.Value.OnlineUrl}/google/buscar.do?indice={indice}&fulltext={search}&sessionid={sesion}&startat={start}&maxresults={max}";

                using (var response = await _clientOnline.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<Document[]>(rawResult));
                            result.data = resultado?.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Erro_Get_Documents",
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

        public async Task<Result<DocumentsCount>> GetDocumentsCountAsync(string sesion, string search)
        {
            var result = new Result<DocumentsCount>(new DocumentsCount());
            return result;
        }

        public async Task<Result<Document>> GetDocumentByNrefAsync(string sesion, string producto, string nref)
        {
            var result = new Result<Document>(new Document());
            return result;
        }

        public async Task<Result<List<Document>>> GetDbDocumentsAsync(string sesion, string search, string producto, string orden, string universal, string tipoDoc)
        {
            var result = new Result<List<Document>>(new List<Document>());
            return result;
        }

    }
}