using System;
using System.Linq;
using System.Threading.Tasks;
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
                    TraceError(result.errors, new GoogleAccountDomainException("Error de Autorización de google"), $"Hay un error en la au....r {error}", "GA02");
                }
                var resultUser = await _context.UserGoogleAccounts.Find(GetFilterUser(UserId)).FirstOrDefaultAsync();

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

                // _context.UserGoogleAccounts.UpdateOneAsync(GetFilterUser(UserId, false), )

                result.data = credential;

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA02", "MONGO");
            }

            return result;
        }

        public async Task<Result<bool>> UpdateCredentialsSuccess(Credential data, string UserId)
        {
            Result<bool> result = new Result<bool>();

            try
            {
                var resultUser = await _context.UserGoogleAccounts.Find(GetFilterUser(UserId)).FirstOrDefaultAsync();

                var _credential = resultUser.Credentials.Where(x => x.Id == data.Id).SingleOrDefault();
                resultUser.Credentials.Remove(_credential);
                resultUser.Credentials.Add(data);

                // Ayuda con la implementación de UpdateOneAsync
                // _context.UserGoogleAccounts.UpdateOneAsync(GetFilterUser(UserId, false), )

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA02", "MONGO");
            }

            result.data = true;
            return result;


        }
    }
}
