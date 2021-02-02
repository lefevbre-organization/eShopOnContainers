using System;
using System.Collections.Generic;
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
    public class CredentialService : BaseClass<CredentialService>, ICredentialService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly ICredentialRepository repository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<CredentialService> logger;

        public CredentialService(
            IOptions<GoogleAccountSettings> settings
            , ICredentialRepository repository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<CredentialService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public async Task<Result<UserResponse>> GetUserCredential(string LefebvreCredential) => 
            await repository.GetUserCredential(LefebvreCredential);

        public async Task<Result<List<UserCredentialResponse>>> GetCredentials(string LefebvreCredential) =>
            await repository.GetCredentials(LefebvreCredential);

        public async Task<Result<OAuth2TokenModel>> GetToken(string LefebvreCredential, GoogleProduct Product) =>
            await repository.GetToken(LefebvreCredential, Product);

        public async Task<Result<UserResponse>> CreateUserCredential(string LefebvreCredential) =>
            await repository.CreateUserCredential(LefebvreCredential);

        public async Task<Result<UserCredentialResponse>> CreateCredential(string LefebvreCredential, CreateCredentialRequest request) =>
            await repository.CreateCredential(LefebvreCredential, request);

        public async Task<Result<string>> GetAuthorizationLink(string LefebvreCredential, GoogleProduct product) =>
            await repository.GetAuthorizationLink(LefebvreCredential, product);

    }
}
