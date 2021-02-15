using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using Infrastructure.Repositories;
    using Model;

    public class ScopeService : BaseClass<ScopeService>, IScopeService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IScopeRepository repository;
        private readonly IEventBus eventBus;

        public ScopeService(
            IOptions<GoogleAccountSettings> settings
            , IScopeRepository repository
            , IEventBus eventBus
            , ILogger<ScopeService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
        }

        public async Task<Result<GoogleAccountScope>> CreateScope(GoogleAccountScope scope) =>
            await repository.CreateScope(scope);

        public async Task<Result<bool>> DeleteScope(string ScopeId) =>
            await repository.DeleteScope(ScopeId);

        public async Task<Result<List<GoogleAccountScope>>> GetScopes(GoogleProduct product) =>
            await repository.GetScopes(product);
    }
}