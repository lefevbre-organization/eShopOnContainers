using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
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
    public class CredentialService : BaseClass<CredentialService>, ICredentialService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly ICredentialRepository repository;
        private readonly IScopeRepository scopeRepository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<CredentialService> logger;

        public CredentialService(
            IOptions<GoogleAccountSettings> settings
            , ICredentialRepository repository
            , IScopeRepository scopeRepository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<CredentialService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.scopeRepository = scopeRepository;
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

        public async Task<Result<string>> GetAuthorizationLink(string LefebvreCredential, GoogleProduct product)
        {
            Result<string> result = new Result<string>();

            try
            {
                Credential credential = (await repository.GetCredentialUserForProduct(LefebvreCredential, product)).data;

                List<GoogleAccountScope> scopes = (await scopeRepository.GetScopes(product)).data;

                StringBuilder _scopes = new StringBuilder();

                if (scopes == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("There are no scopes registered for this product."));
                    return result;
                }

                for (int i = 0; i < scopes.Count - 1; i++)
                {
                    if (i != 0)
                    {
                        _scopes.Append(" ");
                    }
                    _scopes.Append(scopes[i].Url);
                }

                string url = "https://accounts.google.com/o/oauth2/v2/auth?";
                url += "access_type=offline";
                url += "&response_type=code";
                url += "&client_id=";
                url += credential.ClientId;
                url += "&state=";
                url += credential.UserId;
                url += "&redirect_uri=";
                url += settings.Value.RedirectSuccessDriveUrl;
                url += "/success";
                url += $"&scope={_scopes.ToString()}";
                url += "&include_granted_scopes=true";

                result.data = url;

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA01");
            }

            return result;
        }
            

    }
}
