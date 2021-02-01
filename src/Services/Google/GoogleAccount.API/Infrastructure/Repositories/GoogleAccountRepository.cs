using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.IntegrationsEvents.Events;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class GoogleAccountRepository : BaseClass<GoogleAccountRepository>, IGoogleAccountRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleDriveSettings> _settings;
        private readonly IEventBus _eventBus;

        public GoogleAccountRepository(
              IOptions<GoogleDriveSettings> settings
            , IEventBus eventBus
            , ILogger<GoogleAccountRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleAccountContext(settings, eventBus);
        }



        public async Task<Result<UserGoogleAccount>> GetUserAsync(string idUser, short idApp)
        {
            var filter = GetFilterUser(idUser, idApp);
            return await GetUserCommonAsync(filter);
        }


        private async Task<Result<UserGoogleAccount>> GetUserCommonAsync(FilterDefinition<UserGoogleAccount> filter)
        {
            var result = new Result<UserGoogleAccount>();
            try
            {
                result.data = await _context.UserGoogleAccounts.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceError(result.errors, new GoogleAccountDomainException($"No se encuentra ningún usuario"), Codes.GoogleDrive.Get, Codes.Areas.Mongo);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleAccountDomainException($"Error when get users", ex),
                           Codes.GoogleDrive.Get,
                           Codes.Areas.Mongo
                           );
            }
            return result;
        }

        public async Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user)
        {
            var result = new Result<UserGoogleAccount>();
            ReviewUser(user);

            try
            {
                var resultReplace = await _context.UserGoogleAccounts.ReplaceOneAsync(GetFilterUser(user.idNavision, user.idApp), user, GetUpsertOptions());

                user.Id = ManageUpsert<UserGoogleAccount>($"Don´t insert or modify the user {user.idNavision}",
                    $"Se modifica el usuario {user.idNavision}",
                    $"Se inserta el usuario {user.idNavision} con {resultReplace.UpsertedId}",
                     result, resultReplace);

                result.data = user;

                var eventAssoc = new AddUserGoogleAccountIntegrationEvent(user.idNavision, user.idApp);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleAccountDomainException("Error when create user conference", ex),
                           Codes.GoogleAccount.Create,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        private string ManageUpsert<T>(string msgError, string msgModify, string msgInsert, Result<T> result, ReplaceOneResult resultReplace)
        {
            if (resultReplace.IsAcknowledged)
            {
                if (resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, msgModify, Codes.GoogleAccount.Create);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert, Codes.GoogleAccount.Create);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceError(result.errors,
                           new GoogleAccountDomainException(msgError),
                           Codes.GoogleAccount.Create,
                           Codes.Areas.Mongo);
            }
            return null;
        }

        private void ReviewUser(UserGoogleAccount userMail)
        {
            userMail.idNavision = userMail.idNavision.ToUpperInvariant();
        }

        private static FilterDefinition<UserGoogleAccount> GetFilterUser(string idUser, short idApp = 1)
        {
            return Builders<UserGoogleAccount>.Filter.And(
                Builders<UserGoogleAccount>.Filter.Eq(u => u.idNavision, idUser.ToUpperInvariant()),
                Builders<UserGoogleAccount>.Filter.Eq(u => u.idApp, idApp)
                );
        }



    }
}