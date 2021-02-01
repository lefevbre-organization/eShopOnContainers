using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{


    /// Aquí va toda la logica 
    
    public class GoogleAccountService : BaseClass<GoogleAccountService>, IGoogleAccountService
    {
        public readonly IGoogleAccountRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<GoogleAccountSettings> _settings;

        public GoogleAccountService(
                IOptions<GoogleAccountSettings> settings
                , IGoogleAccountRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<GoogleAccountService> logger
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

        //public async Task<Result<UserGoogleAccount>> GetUserAsync(string idNavisionUser, short idApp)
        //    => await _repo.GetUserAsync(idNavisionUser, idApp);

        //public async Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user)
        //    => await _repo.PostUserAsync(user);

    }
}