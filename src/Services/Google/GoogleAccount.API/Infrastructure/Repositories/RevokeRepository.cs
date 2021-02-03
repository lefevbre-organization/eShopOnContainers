using System;
using System.Linq;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class RevokeRepository : BaseClass<RevokeRepository>, IRevokeRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public RevokeRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<RevokeRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }

        private async Task<GoogleAccountUser> GetUser(string LefebvreCredential)
        {
            return await _context.UserGoogleAccounts.Find(GetFilterUser(LefebvreCredential)).FirstOrDefaultAsync();
        }

        private static FilterDefinition<GoogleAccountUser> GetFilterUser(string LefebvreCredential, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountUser>.Filter.And(
                Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential.ToUpperInvariant()),
                Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true));
            }

            return Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, LefebvreCredential.ToUpperInvariant());
        }

        public async Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential)
        {
            Result<bool> result = new Result<bool>();
            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not Found"));
                    return result;
                }

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

                if (credential == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User Credential not Found."));
                    return result;
                }

                credential.Access_Token = "";
                credential.Refresh_Token = "";
                credential.Code = "";

                // TODO Remover la credencial del objeto

                result.data = true;

                TraceInfo(result.infos, "Credential revoke.");
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException(ex.Message));
            }

            return result;
        }
    }
}
