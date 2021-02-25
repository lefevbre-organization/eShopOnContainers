using System.Threading.Tasks;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using Infrastructure.Repositories;
    public class RevokeService : BaseClass<RevokeService>, IRevokeService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IRevokeRepository repository;
        private readonly IEventBus eventBus;

        public RevokeService(
            IOptions<GoogleAccountSettings> settings
            , IRevokeRepository repository
            , IEventBus eventBus

            , ILogger<RevokeService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;

        }

        public async Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential) =>
            await repository.GetRevokingDriveCredentialAsync(LefebvreCredential);
        
    }
}
