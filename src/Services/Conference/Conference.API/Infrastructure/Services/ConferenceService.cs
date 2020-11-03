using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
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

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services
{
    public class ConferenceService : BaseClass<ConferenceService>, IConferenceService
    {
        public readonly IConferenceRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientJitsi;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<ConferenceSettings> _settings;

        public ConferenceService(
                IOptions<ConferenceSettings> settings
                , IConferenceRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<ConferenceService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repo = databaseRepository ?? throw new ArgumentNullException(nameof(databaseRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _clientJitsi = _clientFactory.CreateClient();
            _clientJitsi.BaseAddress = new Uri(_settings.Value.JitsiUrl);
            _clientJitsi.DefaultRequestHeaders.Add("Accept", "application/json");
            //_clientJitsi.DefaultRequestHeaders.Add("Content-Type", "application/json");

            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }


        public async Task<Result<UserConference>> GetUserAsync(string idNavisionUser, int idApp)
        {
            var result = new Result<UserConference>(new UserConference());
            return result;
        }

        public async Task<Result<UserConference>> PostUserAsync(UserConference user)
        {
            var result = new Result<UserConference>(new UserConference());
            return result;
        }

        public async Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, int idApp)
        {
            var result = new Result<List<ConferenceSimple>>(new List<ConferenceSimple>());

            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/conferences";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceSimple[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        TraceError(result.errors, new ConferenceDomainException($"Error when get list of conferences ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Get, "JITSISVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when get data of conferences {_settings.Value.JitsiUrl}", ex), Codes.Conferences.Get, "JITSISVC");
            }

            return result;
        }

        public async Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, int idApp, ConferenceModel conference)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            try
            {
                var path = $"/colibri/conferences";
                SerializeObjectToPost(conference, path, out string url, out StringContent data);
                using (var response = await _clientJitsi.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceModel>(rawResult));
                            result.data = resultado;
                        }

                    }
                    else
                        TraceError(result.errors, new ConferenceDomainException($"Probably error in jitsi when create conference -> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Create, "JITSISVC");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when call internal service of Jitsi", ex), Codes.Conferences.Create, "JITSISVC");
            }
            return result;
        }

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.JitsiUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = parameters == null ? "{}": JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        public async Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/conferences/{id}";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceModel>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors, new ConferenceDomainException($"Error when get data of conference ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Get, "JITSISVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when get data of conference: {id} in {_settings.Value.JitsiUrl}", ex), Codes.Conferences.Get, "JITSISVC");
            }

            return result;
        }

        public async Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceStats>(new ConferenceStats());
            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/stats";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceStats>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors, new ConferenceDomainException($"Error when get list of conferences ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Get, "JITSISVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when get data of conferences {_settings.Value.JitsiUrl}", ex), Codes.Conferences.Get, "JITSISVC");
            }

            return result;
        }

    }
}