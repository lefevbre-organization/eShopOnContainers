using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using Exceptions;
    using Model;

    public class GoogleDriveRepository : BaseClass<GoogleDriveRepository>, IGoogleDriveRepository
    {
        private readonly GoogleDriveContext _context;
        private readonly IOptions<GoogleDriveSettings> _settings;
        private readonly IEventBus _eventBus;

        public GoogleDriveRepository(
              IOptions<GoogleDriveSettings> settings
            , IEventBus eventBus
            , ILogger<GoogleDriveRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleDriveContext(settings, eventBus);
        }

        public async Task<Result<UserGoogleDrive>> GetUserAsync(string idUser, short idApp)
        {
            var filter = GetFilterUser(idUser, idApp);
            return await GetUserCommonAsync(filter);
        }

        private async Task<Result<UserGoogleDrive>> GetUserCommonAsync(FilterDefinition<UserGoogleDrive> filter)
        {
            var result = new Result<UserGoogleDrive>();
            try
            {
                result.data = await _context.UserGoogleDrives.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceError(result.errors, new GoogleDriveDomainException($"No se encuentra ningún usuario"), Codes.GoogleDrive.Get, Codes.Areas.Mongo);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleDriveDomainException($"Error when get users", ex),
                           Codes.GoogleDrive.Get,
                           Codes.Areas.Mongo
                           );
            }
            return result;
        }

        public async Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user)
        {
            var result = new Result<UserGoogleDrive>();
            ReviewUser(user);

            try
            {
                var resultReplace = await _context.UserGoogleDrives.ReplaceOneAsync(GetFilterUser(user.idNavision, user.idApp), user, GetUpsertOptions());

                user.Id = ManageUpsert<UserGoogleDrive>($"Don´t insert or modify the user {user.idNavision}",
                    $"Se modifica el usuario {user.idNavision}",
                    $"Se inserta el usuario {user.idNavision} con {resultReplace.UpsertedId}",
                     result, resultReplace);

                result.data = user;

                //var eventAssoc = new AddUserGoogleDriveIntegrationEvent(user.idNavision, user.idApp);
                //_eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new GoogleDriveDomainException("Error when create user conference", ex),
                           Codes.GoogleDrive.Create,
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
                    TraceInfo(result.infos, msgModify, Codes.GoogleDrive.Create);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert, Codes.GoogleDrive.Create);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceError(result.errors,
                           new GoogleDriveDomainException(msgError),
                           Codes.GoogleDrive.Create,
                           Codes.Areas.Mongo);
            }
            return null;
        }

        private void ReviewUser(UserGoogleDrive userMail)
        {
            userMail.idNavision = userMail.idNavision.ToUpperInvariant();
        }

        private static FilterDefinition<UserGoogleDrive> GetFilterUser(string idUser, short idApp = 1)
        {
            return Builders<UserGoogleDrive>.Filter.And(
                Builders<UserGoogleDrive>.Filter.Eq(u => u.idNavision, idUser.ToUpperInvariant()),
                Builders<UserGoogleDrive>.Filter.Eq(u => u.idApp, idApp)
                );
        }
    }
}