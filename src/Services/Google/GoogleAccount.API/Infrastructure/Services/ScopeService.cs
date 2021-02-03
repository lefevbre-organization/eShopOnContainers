using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public class ScopeService : BaseClass<ScopeService>, IScopeService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IScopeRepository repository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<ScopeService> logger;

        public ScopeService(
            IOptions<GoogleAccountSettings> settings
            , IScopeRepository repository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<ScopeService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public async Task<Result<GoogleAccountScope>> CreateScope(GoogleAccountScope scope) =>
            await repository.CreateScope(scope);

        public async Task<Result<bool>> DeleteScope(string ScopeId) =>
            await repository.DeleteScope(ScopeId);

        public async Task<Result<List<GoogleAccountScope>>> GetScopes(GoogleProduct product) =>
            await repository.GetScopes(product);
    }
}