using System;
using System.Net.Http;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public class AuthService : BaseClass<AuthService>, IAuthService
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
    }
}
