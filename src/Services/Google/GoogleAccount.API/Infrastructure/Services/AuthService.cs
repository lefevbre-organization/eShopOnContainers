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
    public class AuthService : BaseClass<AuthService>, IAuthService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IAuthRepository repository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<GoogleAccountService> logger;

        public AuthService(
            IOptions<GoogleAccountSettings> settings
            , IAuthRepository repository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<AuthService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }


        public async Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "") =>
            await repository.Success(product, UserId, code, scope, error);


    }
}
