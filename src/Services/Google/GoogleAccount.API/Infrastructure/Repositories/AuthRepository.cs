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
                    TraceError(result.errors,
                               new GoogleAccountDomainException($"Error de Autorización de google {error}"),
                               Codes.GoogleAccount.GetCredentials,
                               Codes.Areas.Mongo);
                }
                var resultUser = await _context.UserGoogleAccounts.Find(GetFilterUser(UserId)).FirstOrDefaultAsync();

                if (resultUser == null)
                {
                    TraceInfo(result.infos, "no encuentro ningún credencial con esos datos", Codes.GoogleAccount.GetCredentials);
                    return result;
                }

                //Credential credential = resultUser.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);
                Credential credential = resultUser.Credentials.SingleOrDefault(x => x.Product == product && x.Active == true);

                if (credential == null)
                {
                    TraceInfo(result.infos, "No se obtiene credential activo parta drive", Codes.GoogleAccount.GetCredentials);
                    return result;
                }

                credential.Code = code;

                //var resultUpdate = await _context.UserGoogleAccounts.UpdateOneAsync(
                //    GetFilterUser(LefebvreCredential),
                //    Builders<GoogleAccountUser>.Update.Set($"credentias.$[i]", config),
                //    new UpdateOptions { ArrayFilters = arrayFilters }
                //);

                result.data = credential;

            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleAccountDomainException("Error", ex),
                           Codes.GoogleAccount.GetCredentials,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        public async Task<Result<bool>> UpdateCredentialsSuccess(Credential data, string GooogleAccountUserId)
        {
            Result<bool> result = new Result<bool>();

            try
            {
                //var resultUser = await _context.UserGoogleAccounts.Find(GetFilterUser(GooogleAccountUserId)).FirstOrDefaultAsync();

                //var _credential = resultUser.Credentials.Where(x => x.Id == data.Id).SingleOrDefault();
                //resultUser.Credentials.Remove(_credential);
                //resultUser.Credentials.Add(data);

                var update = Builders<GoogleAccountUser>.Update
                    .Set("Credentials.$.Access_Token", data.Access_Token)
                    .Set("Credentials.$.Refresh_Token", data.Refresh_Token)
                    .Set("Credentials.$.Duration", data.Duration)
                    .Set("Credentials.$.Token_Type", data.Token_Type)
                    .Set("Credentials.$.Scope", data.Scope)
                    .Set("Credentials.$.Code", data.Code);

                var resultUpdate = await _context.UserGoogleAccounts.UpdateOneAsync(
                        Builders<GoogleAccountUser>.Filter.And(
                          Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, GooogleAccountUserId),
                          Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true),
                          Builders<GoogleAccountUser>.Filter.ElemMatch(u => u.Credentials, Builders<Credential>.Filter.Eq(c => c.Id, data.Id))
                        ),
                        update
                );

                result.data = ManageUpdate($"Don´t change de Credential of {GooogleAccountUserId}",
                    $"Credential update for {GooogleAccountUserId}",
                    result, resultUpdate, Codes.GoogleAccount.UpdateCredentials);

            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleAccountDomainException("Error", ex),
                           Codes.GoogleAccount.UpdateCredentials,
                           Codes.Areas.Mongo);
            }

          //  result.data = true;
            return result;


        }
    }
}
