using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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
        private readonly HttpClient _clientOnline;
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
            return result;
        }

        public async Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, int idApp, ConferenceModel conference)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            return result;
        }

        public async Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            return result;
        }

        public async Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceStats>(new ConferenceStats());
            return result;
        }

    }
}