using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
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

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories
{
    public class ConferenceRepository : BaseClass<ConferenceRepository>, IConferenceRepository
    {
        private readonly ConferenceContext _context;
        private readonly IOptions<ConferenceSettings> _settings;
        private readonly IEventBus _eventBus;

        public ConferenceRepository(
              IOptions<ConferenceSettings> settings
            , IEventBus eventBus
            , ILogger<ConferenceRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new ConferenceContext(settings, eventBus);
        }

        //private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        //{
        //    var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
        //    await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
        //    await _context.PublishThroughEventBusAsync(eventAssoc, session);
        //}

        public async Task<Result<UserConference>> GetUserAsync(string idUser, short idApp)
        {
            var result = new Result<UserConference>();
            try
            {
                result.data = await _context.UserConferences.Find(GetFilterUser(idUser, idApp)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceError(result.errors, new ConferenceDomainException($"No se encuentra ningún usuario {idUser}"), Codes.Conferences.Get, Codes.Areas.Mongo);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new ConferenceDomainException($"Error when get user {idUser}", ex),
                           Codes.Conferences.Get,
                           Codes.Areas.Mongo
                           );
            }
            return result;
        }

        public async Task<Result<UserConference>> PostUserAsync(UserConference user)
        {
            var result = new Result<UserConference>();
            ReviewUser(user);

            try
            {
                var resultReplace = await _context.UserConferences.ReplaceOneAsync(GetFilterUser(user.idNavision, user.idApp), user, GetUpsertOptions());

                user.Id = ManageUpsert<UserConference>($"Don´t insert or modify the user {user.idNavision}",
                    $"Se modifica el usuario {user.idNavision}",
                    $"Se inserta el usuario {user.idNavision} con {resultReplace.UpsertedId}",
                     result, resultReplace);

                result.data = user;

                var eventAssoc = new AddUserConferenceIntegrationEvent(user.idNavision, user.idApp);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new ConferenceDomainException("Error when create user conference", ex),
                           Codes.Conferences.Create,
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
                    TraceInfo(result.infos, msgModify, Codes.Conferences.Create);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert, Codes.Conferences.Create);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceError(result.errors,
                           new ConferenceDomainException(msgError),
                           Codes.Conferences.Create,
                           Codes.Areas.Mongo);
            }
            return null;
        }

        private void ReviewUser(UserConference userMail)
        {
            userMail.idNavision = userMail.idNavision.ToUpperInvariant();
        }

        private static FilterDefinition<UserConference> GetFilterUser(string idUser, short idApp = 1)
        {
            return Builders<UserConference>.Filter.And(
            Builders<UserConference>.Filter.Eq(u => u.idNavision, idUser.ToUpperInvariant()),
            Builders<UserConference>.Filter.Eq(u => u.idApp, idApp));
        }

        public async Task<Result<UserConference>> UpsertRoomAsync(string idUser, short idApp, Room room)
        {
            var result = new Result<UserConference>();

            var user = await GetUserAsync(idUser, idApp);
            var rooms = user.data.rooms?.ToList();
            var roomFind = rooms?.FirstOrDefault(x => x.id == room.id || ( x.name != null && x.name.Equals(room.name)));
            if (roomFind == null)
            {
                TraceInfo(result.infos, $"Se crea la room {room.id} del usuario {idUser}", Codes.Conferences.RoomCreate);
                rooms.Add(room);
            }
            else
            {
                TraceInfo(result.infos, $"Se modifica la room {room.id} del usuario {idUser}", Codes.Conferences.RoomCreate);
                roomFind = room;
            }

            user.data.rooms = rooms.ToArray();

            var resultReplace = await _context.UserConferences.ReplaceOneAsync(GetFilterUser(idUser, idApp), user.data, GetUpsertOptions());

            if (resultReplace.IsAcknowledged && resultReplace.IsModifiedCountAvailable)
            {

                var eventReplace = new ManageRoomIntegrationEvent(idUser, idApp, room, roomFind);
                _eventBus.Publish(eventReplace);

                result.data = user.data;
                result.data.rooms = new Room[] { room };
            }

            return result;
        }

        private static List<ArrayFilterDefinition> GetFilterFromRooms(string roomId)
        {
            return new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.id", roomId)))
            };
        }

        public async Task<Result<UserConference>> GetRoomAsync(string idUser, short idApp, string id)
        {
            var result = new Result<UserConference>();
            try
            {
                var resultUser = await GetUserAsync(idUser, idApp);
                if (resultUser.data == null)
                    TraceError(result.errors, new Exception($"No se encuentra ningún usuario {idUser}"), Codes.Conferences.RoomGet, Codes.Areas.Mongo);
                else
                {
                    var rooms = resultUser.data?.rooms?.ToList();
                    if (rooms?.Count > 0)
                    {
                        var sala = rooms?.Find(GetFilterRoomId(id));

                        if (sala == null)
                            TraceInfo(result.infos, $"No se encuentra ningúna sala con ese id {id} del usuario {idUser}", Codes.Conferences.RoomGet);

                        result.data.rooms = new Room[] { sala };
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new ConferenceDomainException($"Error when get room {id} of {idUser}", ex),
                           Codes.Conferences.RoomGet,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        private static Predicate<Room> GetFilterRoomId(string idRoom)
        {
            return x => x.id.Equals(idRoom);
        }
    }
}