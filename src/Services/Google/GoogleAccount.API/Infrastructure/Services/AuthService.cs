using System;
using System.Net.Http;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public class AuthService : BaseClass<AuthService>, IGoogleAuthService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IGoogleAccountRepository googleAccountRepository1;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<GoogleAccountService> logger;

        public AuthService(
            IOptions<GoogleAccountSettings> settings
            , IGoogleAccountRepository googleAccountRepository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<AuthService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.googleAccountRepository1 = googleAccountRepository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public Task<Result<UserGoogleAccount>> GetUserAsync(string idNavisionUser, short idApp)
        {
            throw new NotImplementedException();
        }

        public Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user)
        {
            throw new NotImplementedException();
        }

        public Task<Result<string>> SaveCode(string state, string code)
        {
            throw new NotImplementedException();
        }
    }
}
