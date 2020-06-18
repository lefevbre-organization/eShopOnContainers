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
        private readonly HttpClient _client;
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

            _client = _clientFactory.CreateClient();
            _client.BaseAddress = new Uri(_settings.Value.OnlineUrl);
            _client.DefaultRequestHeaders.Add("Accept", "text/plain");

            _client = _clientFactory.CreateClient();
            _client.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _client.DefaultRequestHeaders.Add("Accept", "text/plain");


        }



        public Task<Result<string>> GetSesionAsync(string idNavisionUser)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<List<Document>>> GetDocumentsAsync(string sesion, string search, string indice, int start, int max)
        {
            var result = new Result<List<Document>>(new List<Document>());
            try
            {
                //https://herculesppd.lefebvre.es/webclient46/google/buscar.do?indice=...&fulltext=...&jsessionid=...&startat=...&maxresults=
                var url = $"{_settings.Value.OnlineUrl}/google/buscar.do?indice={indice}&fulltext={search}&sessionid={sesion}&startat={start}&maxresults={max}";

                using (var response = await _client.GetAsync(url))
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