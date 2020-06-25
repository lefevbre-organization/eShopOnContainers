﻿using Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Database.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
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
            var result = new Result<string>(null);
            try
            {
                var encodeUser = await GetEncodeUserAsync(idNavisionUser);
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

        public async Task<Result<string>> GetEncodeUserAsync(string idNavisionUser)
        {
            var result = new Result<string>(string.Empty);
            try
            {
                //https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=E1654569
                var url = $"{_settings.Value.OnlineUrl}/ws/encriptarEntrada.do?nEntrada={idNavisionUser}";

                using var response = await _clientOnline.GetAsync(url);
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

        public async Task<Result<DbDocSearch>> GetDocumentsAsync(string idNavisionUser, string search, string indice, int start, int max)
        {
            var result = new Result<DbDocSearch>(new DbDocSearch());
            try
            {
                //TODO: Hacer sistema de control de sesion en mongo y solictarlo si ha pasaso un tiempo
                var resultSession = await GetSesionAsync(idNavisionUser);
               //https://herculesppd.lefebvre.es/webclient46/google/buscar.do?indice=legislacion&fulltext=derecho&jsessionid=0372AF1F4CA95776AEA01F5832AF69CF.TC_ONLINE_PRE01
                var url = $"{_settings.Value.OnlineUrl}/google/buscar.do?indice={indice}&fulltext={search}&sessionid={resultSession?.data}&startat={start}&maxresults={max}";

                using var response = await _clientOnline.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var rawResult = await response.Content.ReadAsStringAsync();

                    if (!string.IsNullOrEmpty(rawResult))
                    {
                        var resultado = (JsonConvert.DeserializeObject<DbDocSearch>(rawResult));
                        result.data = resultado;
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

        public async Task<Result<DbDocCount>> GetDocumentsCountAsync(string idNavisionUser, string search)
        {
            var result = new Result<DbDocCount>(new DbDocCount());
            try
            {
                var resultSession = await GetSesionAsync(idNavisionUser);

                //https://herculesppd.lefebvre.es/webclient46/google/getResultadosPorIndice.do?fulltext=...&jsessionid=....
                var url = $"{_settings.Value.OnlineUrl}/google/getResultadosPorIndice.do?fulltext={search}&jsessionid={resultSession?.data}";

                using var response = await _clientOnline.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var rawResult = await response.Content.ReadAsStringAsync();

                    if (!string.IsNullOrEmpty(rawResult))
                    {
                        var resultado = (JsonConvert.DeserializeObject<DbDocCount>(rawResult));
                        result.data = resultado;
                    }
                }
                else
                {
                    result.errors.Add(new ErrorInfo
                    {
                        code = "Error_DocumentCount_Service",
                        detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                    });
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

        public async Task<Result<DbDocument>> GetDocumentByNrefAsync(string idNavisionUser, string producto, string nref)
        {
            var result = new Result<DbDocument>(new DbDocument());
            try
            {
                var encodeUser = await GetEncodeUserAsync(idNavisionUser);
                //https://herculesppd.lefebvre.es/webclient46/login.do?ei=xxx&producto_inicial=UNIVERSAL&nref=xxx
                var url = $"{_settings.Value.OnlineUrl}/login.do?ei={encodeUser?.data}&producto_inicial={producto}&nref={nref}";

                using var response = await _clientOnline.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var rawResult = await response.Content.ReadAsStringAsync();

                    if (!string.IsNullOrEmpty(rawResult))
                    {
                        var resultado = (JsonConvert.DeserializeObject<DbDocument>(rawResult));
                        result.data = resultado;
                    }
                }
                else
                {
                    result.errors.Add(new ErrorInfo
                    {
                        code = "Error_DocumentByNref_Service",
                        detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                    });
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

        public async Task<Result<List<DbDocument>>> GetDbDocumentsAsync(string sesion, string search, string producto, string orden, string universal, string tipoDoc)
        {
            var result = new Result<List<DbDocument>>(new List<DbDocument>());
            try
            {
                //http://herculesppd.lefebvre.es/webclient46/seleccionProducto.do?producto=UNIVERSAL&orden=relevancia&universal=derecho&jsessionId=xxx&subindices=xxxx
                var url = $"{_settings.Value.OnlineUrl}/seleccionProducto.do?producto={producto}&orden={orden}&universal={universal}&jsessionId={sesion}&subindices={tipoDoc}";

                using var response = await _clientOnline.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var rawResult = await response.Content.ReadAsStringAsync();

                    if (!string.IsNullOrEmpty(rawResult))
                    {
                        var resultado = (JsonConvert.DeserializeObject<DbDocument[]>(rawResult));
                        result.data = resultado?.ToList();
                    }
                }
                else
                {
                    result.errors.Add(new ErrorInfo
                    {
                        code = "Erro_Get_DocumentsDb",
                        detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                    });
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "594",
                    detail = $"General error when call DocumentsDb service",
                    message = ex.Message
                });
            }

            return result;
        }
    }
}