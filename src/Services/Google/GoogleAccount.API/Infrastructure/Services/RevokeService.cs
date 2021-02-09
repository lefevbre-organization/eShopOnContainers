using System;
using System.Net.Http;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public class RevokeService : BaseClass<RevokeService>, IRevokeService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IRevokeRepository repository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;

        public RevokeService(
            IOptions<GoogleAccountSettings> settings
            , IRevokeRepository repository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<RevokeService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public async Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential) =>
            await repository.GetRevokingDriveCredentialAsync(LefebvreCredential);
        
    }
}
