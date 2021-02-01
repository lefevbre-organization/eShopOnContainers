using System;
using System.Net.Http;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public class CredentialService : BaseClass<CredentialService>, ICredentialService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IGoogleAccountRepository googleAccountRepository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<GoogleAccountService> logger;

        public CredentialService(
            IOptions<GoogleAccountSettings> settings
            , IGoogleAccountRepository googleAccountRepository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<CredentialService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.googleAccountRepository = googleAccountRepository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        
    }
}
