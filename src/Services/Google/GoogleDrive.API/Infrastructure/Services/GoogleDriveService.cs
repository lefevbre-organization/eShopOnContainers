using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using Model;
    using Repositories;

    public class GoogleDriveService : BaseClass<GoogleDriveService>, IGoogleDriveService
    {
        public readonly IGoogleDriveRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<GoogleDriveSettings> _settings;

        public GoogleDriveService(
                IOptions<GoogleDriveSettings> settings
                , IGoogleDriveRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<GoogleDriveService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repo = databaseRepository ?? throw new ArgumentNullException(nameof(databaseRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        public async Task<Result<UserGoogleDrive>> GetUserAsync(string idNavisionUser, short idApp)
            => await _repo.GetUserAsync(idNavisionUser, idApp);

        public async Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user)
            => await _repo.PostUserAsync(user);
    }
}