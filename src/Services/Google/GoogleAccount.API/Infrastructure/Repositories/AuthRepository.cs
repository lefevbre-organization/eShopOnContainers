using System;
using System.Linq;
using System.Net.Http;
using System.Text;
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
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class AuthRepository: BaseClass<AuthRepository>, IAuthRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;

        public AuthRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<AuthRepository> logger
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleAccountContext(settings, eventBus);
        }

        private static FilterDefinition<GoogleAccountUser> GetFilterUser(string idUser, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountUser>.Filter.And(
                Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, idUser.ToUpperInvariant()),
                Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true));
            }

            return Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, idUser.ToUpperInvariant());
        }

        public async Task<Result<Credential>> GetGredentials(GoogleProduct product, string UserId, string code, string scope, string error = "")
        {
            Result<Credential> result = new Result<Credential>(new Credential());

            try
            {
                if (error != "")
                {
                    TraceInfo(result.infos, "Hay un error en la au....r {error}", "GA02");
                }
                var resultUser = await _context.UserGoogleAccounts.Find(GetFilterUser(UserId)).FirstOrDefaultAsync();
               // User user = await context.Users.Include(x => x.Credentials).FirstOrDefaultAsync(x => x.Id == Guid.Parse(UserId));

                if (resultUser == null)
                {
                    TraceInfo(result.infos, "no encuentro ningún credencial con esos datos", "GA01");
                    return result;
                }

                Credential credential = resultUser.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

                if (credential == null)
                {
                    TraceInfo(result.infos, "No se obtiene credential activo parta drive", "GA02");
                    return result;
                }

                credential.Code = code;

                context.Credentials.Update(credential);
                await context.SaveChangesAsync();

                result.data = credential;

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA02", "SQLLITE");
            }

            return result;
        }

        public async Task<Result<bool>> UpdateCredentialsSuccess(Credential data)
        {
            Result<bool> result = new Result<bool>();

            context.Credentials.Update(data);
            await context.SaveChangesAsync();

            result.data = true;
            return result;


        }
    }
}
