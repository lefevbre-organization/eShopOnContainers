using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories
{
    public class ConferenceRepository : BaseClass<ConferenceRepository>, IConferenceRepository
    {
        private readonly ConferenceContext _context;
        private readonly IOptions<ConferenceSettings> _settings;

        public ConferenceRepository(
              IOptions<ConferenceSettings> settings
            , IEventBus eventBus
            , ILogger<ConferenceRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _context = new ConferenceContext(settings, eventBus);
        }

        //private static FilterDefinition<CenUser> GetFilterLexUser(string idUser)
        //{
        //    return
        //        Builders<CenUser>.Filter.And(
        //            Builders<CenUser>.Filter.Gte(u => u.version, 1),
        //            Builders<CenUser>.Filter.Eq(u => u.idNavision, idUser)
        //        );
        //}

        private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        {
            var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
            await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
            await _context.PublishThroughEventBusAsync(eventAssoc, session);
        }


         private static IEnumerable<LexEntity> GetEntitiesSearch(IEntitySearchView search, LexCompany company)
        {
            if (search is EntitySearchFoldersView)
            {
                var searchFolder = search as EntitySearchFoldersView;
                return company.entities.Where
                    (ent =>
                        (ent.idType == (searchFolder.idType)
                            && (searchFolder.idFolder == null || (ent.idFolder == searchFolder.idFolder) || (ent.idRelated == searchFolder.idFolder))
                            && (searchFolder.idParent == null || (ent.idRelated == searchFolder.idParent) || (ent.idFolder == searchFolder.idParent))
                            && (searchFolder.search == null || (ent.description.Contains(searchFolder.search) || ent.code.Contains(searchFolder.search) || ent.email.Contains(searchFolder.search)))
                    ));
            }
            else if (search is EntitySearchDocumentsView)
            {
                var searchDoc = search as EntitySearchDocumentsView;
                return company.entities.Where
                    (ent =>
                        (ent.idType == (searchDoc.idType)
                            && (searchDoc.idFolder == null || (ent.idFolder == searchDoc.idFolder) || (ent.idRelated == searchDoc.idFolder))
                            && (searchDoc.search == null || (ent.description.Contains(searchDoc.search) || ent.code.Contains(searchDoc.search) || ent.email.Contains(searchDoc.search)))
                    ));
            }

            var searchSimple = search as EntitySearchView;
            return company.entities.Where
                (ent =>
                    (ent.idType == (searchSimple.idType)
                        && (searchSimple.search != null || (ent.description.Contains(searchSimple.search) || ent.code.Contains(searchSimple.search) || ent.email.Contains(searchSimple.search)))
                ));
        }
        //public async Task<Result<bool>> UpsertEntitiesAsync(IEntitySearchView search, MySqlCompany resultMySql)
        //{
        //    var result = new Result<bool>();

        //    var filterUser = GetFilterLexUser(((EntitySearchView)search).idUser);

        //    try
        //    {
        //        var arrayFiltersSimple = GetFilterFromEntities(((EntitySearchView)search).bbdd);

        //        var resultUpdate = await _context.CenUsers.UpdateOneAsync(
        //            filterUser,
        //            Builders<CenUser>.Update
        //                .AddToSetEach($"companies.$[i].entities", resultMySql.Data.ToArray()),
        //                new UpdateOptions { ArrayFilters = arrayFiltersSimple, IsUpsert = true }
        //        );

        //        if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
        //        {
        //            TraceInfo(result.infos, $"Se modifica el usuario {((EntitySearchView)search).idUser} añadiendo varias entidades {resultUpdate.ModifiedCount} de tipo: {((EntitySearchView)search).idType}");
        //            result.data = resultUpdate.ModifiedCount > 0;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceInfo(result.infos, $"fallo al  actualizar entidades de {((EntitySearchView)search).idUser}: {ex.Message}");
        //    }

        //    return result;
        //}

        //public async Task<Result<bool>> UpsertRelationsAsync(ClassificationSearchView search, MySqlCompany resultMySql)
        //{
        //    var result = new Result<bool>();

        //    var filterUser = GetFilterLexUser(search.idUser);

        //    try
        //    {
        //        var arrayFiltersSimple = GetFilterFromEntities(search.bbdd);

        //        var resultUpdate = await _context.CenUsers.UpdateOneAsync(
        //            filterUser,
        //            Builders<CenUser>.Update
        //                .AddToSetEach($"companies.$[i].actuations", resultMySql.DataActuation.ToArray()),
        //                new UpdateOptions { ArrayFilters = arrayFiltersSimple, IsUpsert = true }
        //        );

        //        if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
        //        {
        //            TraceInfo(result.infos, $"Se modifica el usuario {search.idUser} añadiendo o actualizando las relaciones del mail {search.idMail}");
        //            result.data = resultUpdate.ModifiedCount > 0;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceInfo(result.infos, $"fallo al  actualizar relaciones de {search.idUser}: {ex.Message}");
        //    }

        //    return result;
        //}

        //private static List<ArrayFilterDefinition> GetFilterFromEntities(string bbdd)
        //{
        //    return new List<ArrayFilterDefinition>
        //    {
        //        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd)))
        //    };
        //}

        //private static List<ArrayFilterDefinition> GetFilterFromEntity(string bbdd, short? idType, long? idRelated)
        //{
        //    var doc_j = new BsonDocument() {
        //         new BsonElement("j.idType", idType),
        //        new BsonElement("j.idRelated", idRelated)
        //    };

        //    return new List<ArrayFilterDefinition>
        //    {
        //        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd))),
        //        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(doc_j))
        //    };
        //}

        //private static List<ArrayFilterDefinition> GetFilterFromRelation(string bbdd, string uid)
        //{
        //    return new List<ArrayFilterDefinition>
        //    {
        //        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd))),
        //        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument( new BsonElement("j.uid", uid)))
        //    };
        //}

       
        //public async Task<Result<long>> AddClassificationToListAsync(ClassificationAddView actuation)
        //{
        //    var result = new Result<long>(0);
        //    var cancel = default(CancellationToken);
        //    TraceLog(parameters: new string[] { $"idUser:{actuation.idUser}", $"bbdd:{actuation.bbdd}", $"idMail:{actuation.listaMails}", $"idRelated:{actuation.idRelated}", $"idType:{actuation.idType}" });

        //    using (var session = await _context.StartSession(cancel))
        //    {
        //        session.StartTransaction();
        //        try
        //        {
        //            await AddAndPublish(actuation, session, result);

        //            await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
        //        }
        //        catch (Exception ex)
        //        {
        //            TraceInfo(result.infos, $"Error al añadir la actuacion de la entidad {actuation.idRelated} al usuario {actuation.idUser}: {ex.Message}");
        //            session.AbortTransaction();
        //        }
        //    }
        //    return result;
        //}

        //private async Task AddAndPublish(ClassificationAddView actuation, IClientSessionHandle session, Result<long> result)
        //{
        //    foreach (var mailData in actuation.listaMails)
        //    {
        //        var actua = new LexActuation
        //        {
        //            date = mailData.Date,
        //            entityIdType = (short)actuation.idType,
        //            entityType = Enum.GetName(typeof(LexonAdjunctionType), actuation.idType),
        //            idMail = mailData.Uid,
        //            idRelated = (long)actuation.idRelated
        //        };

        //        var resultUpdate = await _context.CenUsersTransaction(session).UpdateOneAsync(
        //             GetFilterLexUser(actuation.idUser),
        //             Builders<CenUser>.Update.AddToSet($"companies.$[i].actuations", actua),
        //             new UpdateOptions { ArrayFilters = GetFilterFromEntities(actuation.bbdd) }
        //         );

        //        if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
        //        {
        //            TraceInfo(result.infos, $"Se modifica el usuario {actuation.idUser} añadiendo actuación");
        //            result.data += 1;

        //            //var eventAssoc = new AssociateMailToEntityIntegrationEvent(_settings.Value.IdAppNavision, actuation.idUser, actua.entityType, actua.idRelated, mailData.Provider, mailData.MailAccount, mailData.Uid, mailData.Subject, mailData.Date);
        //            //await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
        //        }
        //    }
        //}

        //public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView actuation)
        //{
        //    var result = new Result<long>(0);
        //    var cancel = default(CancellationToken);
        //    TraceLog(parameters: new string[] { $"idUser:{actuation.idUser}", $"bbdd:{actuation.bbdd}", $"idMail:{actuation.idMail}", $"idRelated:{actuation.idRelated}", $"idType:{actuation.idType}" });

        //    using (var session = await _context.StartSession(cancel))
        //    {
        //        session.StartTransaction();
        //        try
        //        {
        //            await RemoveAndPublish(actuation, session, result);

        //            await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
        //        }
        //        catch (Exception ex)
        //        {
        //            TraceInfo(result.infos, $"Error al añadir la actuacion de la entidad {actuation.idRelated} al usuario {actuation.idUser}: {ex.Message}");
        //            session.AbortTransaction();
        //        }
        //    }
        //    return result;
        //}

        //private async Task RemoveAndPublish(ClassificationRemoveView actuation, IClientSessionHandle session, Result<long> result)
        //{
        //    var typeName = Enum.GetName(typeof(LexonAdjunctionType), actuation.idType);

        //    var resultUpdate = await _context.CenUsersTransaction(session).UpdateOneAsync(
        //        GetFilterLexUser(actuation.idUser),
        //        Builders<CenUser>.Update.Pull($"companies.$[i].actuations.$[j]", actuation.idMail),
        //            new UpdateOptions
        //            {
        //                ArrayFilters = new List<ArrayFilterDefinition>
        //                    {
        //                        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.bbdd", actuation.bbdd)),
        //                        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", actuation.idMail))
        //                    }
        //            }
        //    );

        //    if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
        //    {
        //        TraceInfo(result.infos, $"Se modifica el usuario {actuation.idUser} eliminando actuación");
        //        result.data = resultUpdate.ModifiedCount;

        //        //var eventAssoc = new DissociateMailFromEntityIntegrationEvent(_settings.Value.IdAppNavision, actuation.idUser, typeName, (long)actuation.idRelated, actuation.Provider, actuation.MailAccount, actuation.idMail);
        //        //await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
        //    }
        //}

    }
}