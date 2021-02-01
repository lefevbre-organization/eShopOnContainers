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
        private readonly IGoogleAccountRepository googleAccountRepository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;
        private readonly ILogger<RevokeService> logger;

        public RevokeService(
            IOptions<GoogleAccountSettings> settings
            , IGoogleAccountRepository googleAccountRepository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<RevokeService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.googleAccountRepository = googleAccountRepository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public async Task<Result<bool>> GetRevokingCredentialAsync(string LefebvreCredential)
        {
            Result<bool> result = new Result<bool>();
            try
            {
                var user = await googleAccountRepository.GetUserAsync(LefebvreCredential);

                if (user == null)
                    TraceError(result.errors, new GoogleAccountDomainException("User not Found"));

                var credential = await googleAccountRepository.GetCredentialUserAsync(user.Id.ToString(), GoogleProduct.Drive, true);

                if(credential == null)
                    TraceError(result.errors, new GoogleAccountDomainException("User Credential not Found."));

                var response = await googleAccountRepository.RevokeCredentialAsync(user.Id.ToString(), credential.Id.ToString());

                result.data = response;

                if (response)
                {
                    TraceInfo(result.infos, "Credential revoke.");
                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException(ex.Message));
            }
            return result;
        }
    }
}
