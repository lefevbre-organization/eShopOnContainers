using Lexon.API.IntegrationsEvents.Events;
using Lexon.API.Model;
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

namespace Lexon.API.Infrastructure.Repositories
{
    public class UsersRepository : BaseClass<UsersRepository>, IUsersRepository
    {
        private readonly LexonContext _context;
        private readonly IOptions<LexonSettings> _settings;

        public UsersRepository(
              IOptions<LexonSettings> settings
            , IEventBus eventBus
            , ILogger<UsersRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _context = new LexonContext(settings, eventBus);
        }

        public async Task<Result<List<LexCompany>>> GetCompaniesListAsync(string idUser)
        {
            var result = new Result<List<LexCompany>>(new List<LexCompany>());

            var filter = GetFilterLexUser(idUser);

            var fields = Builders<LexUser>.Projection
                .Include(x => x.companies)
                .Include(x => x.idUser);

            TraceLog(parameters: new string[] { $"fields:{fields.ToString()} ->filter:{filter.ToString()}" });

            try
            {
                var user = await _context.LexUsers
                            .Find(filter)
                            .Project<LexUser>(fields)
                            .FirstOrDefaultAsync();

                var companies = user?.companies?.ToList();
                result.data = companies ?? new List<LexCompany>();
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener las compañias de {idUser}: {ex.Message}");
            }

            return result;
        }

        private static FilterDefinition<LexUser> GetFilterLexUser(string idUser)
        {
            return
                Builders<LexUser>.Filter.And(
                    Builders<LexUser>.Filter.Gte(u => u.version, 11),
                    Builders<LexUser>.Filter.Or(
                        Builders<LexUser>.Filter.Eq(u => u.idUser, idUser),
                        Builders<LexUser>.Filter.Eq(u => u.idNavision, idUser)
                        )
                );
        }

        private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        {
            var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
            await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
            await _context.PublishThroughEventBusAsync(eventAssoc, session);
        }

        public async Task<Result<LexUser>> GetUserAsync(string idUser)
        {
            var result = new Result<LexUser>(new LexUser());
            var filter = GetFilterLexUser(idUser);
            try
            {
                result.data = await _context.LexUsers.Find(filter).SingleAsync();
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {idUser}: {ex.Message}");
            }
            return result;
        }

        public async Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView search)
        {
            var result = new MySqlCompany();

            try
            {
                var filterUser = GetFilterLexUser(((EntitySearchView)search).idUser);
                TraceLog(parameters: new string[] { $"filter:{filterUser.ToString()}" });

                var user = await _context.LexUsers
                    .Find(filterUser)
                    .FirstOrDefaultAsync();

                var company = user.companies.FirstOrDefault(x => x.bbdd.Contains(((EntitySearchView)search).bbdd));

                var entitiesSearch = GetEntitiesSearch(search, company);

                var entidades = entitiesSearch.ToArray();

                company.entities = entidades;
                result.AddData(company);
            }
            catch (Exception ex)
            {
                TraceInfo(result.Infos, $"fallo al  obtener entidades de {((EntitySearchView)search).idUser}: {ex.Message}");
            }
            return result;
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

        public async Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView search)
        {
            var result = new MySqlCompany();

            try
            {
                var filterUser = GetFilterLexUser(search.idUser);

                var user = await _context.LexUsers
                    .Find(filterUser)
                    .FirstOrDefaultAsync();

                var company = user.companies.FirstOrDefault(x => x.bbdd.Contains(search.bbdd));

                var relationsSearch = company.actuations.Where(ent => ent.idMail == search.idMail);

                var relations = relationsSearch.ToArray();

                // company.actuations = relations;
                // resultMongo.AddData(company);
                var lexMailActuacion = new LexMailActuation
                {
                    uid = search.idMail,
                    actuaciones = relations
                };
                result.AddRelationsMail(lexMailActuacion);
            }
            catch (Exception ex)
            {
                TraceInfo(result.Infos, $"fallo al  obtener actuaciones de {search.idUser}: {ex.Message}");
            }
            return result;
        }

        public async Task<Result<bool>> UpsertEntitiesAsync(IEntitySearchView search, MySqlCompany resultMySql)
        {
            var result = new Result<bool>();

            var filterUser = GetFilterLexUser(((EntitySearchView)search).idUser);

            try
            {
                var arrayFiltersSimple = GetFilterFromEntities(((EntitySearchView)search).bbdd);

                var resultUpdate = await _context.LexUsers.UpdateOneAsync(
                    filterUser,
                    Builders<LexUser>.Update
                        .AddToSetEach($"companies.$[i].entities", resultMySql.Data.ToArray()),
                        new UpdateOptions { ArrayFilters = arrayFiltersSimple, IsUpsert = true }
                );

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {((EntitySearchView)search).idUser} añadiendo varias entidades {resultUpdate.ModifiedCount} de tipo: {((EntitySearchView)search).idType}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  actualizar entidades de {((EntitySearchView)search).idUser}: {ex.Message}");
            }

            return result;
        }

        public async Task<Result<bool>> UpsertRelationsAsync(ClassificationSearchView search, MySqlCompany resultMySql)
        {
            var result = new Result<bool>();

            var filterUser = GetFilterLexUser(search.idUser);

            try
            {
                var arrayFiltersSimple = GetFilterFromEntities(search.bbdd);

                var resultUpdate = await _context.LexUsers.UpdateOneAsync(
                    filterUser,
                    Builders<LexUser>.Update
                        .AddToSetEach($"companies.$[i].actuations", resultMySql.DataActuation.ToArray()),
                        new UpdateOptions { ArrayFilters = arrayFiltersSimple, IsUpsert = true }
                );

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {search.idUser} añadiendo o actualizando las relaciones del mail {search.idMail}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  actualizar relaciones de {search.idUser}: {ex.Message}");
            }

            return result;
        }

        private static List<ArrayFilterDefinition> GetFilterFromEntities(string bbdd)
        {
            return new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd)))
            };
        }

        private static List<ArrayFilterDefinition> GetFilterFromEntity(string bbdd, short? idType, long? idRelated)
        {
            var doc_j = new BsonDocument() {
                 new BsonElement("j.idType", idType),
                new BsonElement("j.idRelated", idRelated)
            };

            return new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd))),
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(doc_j))
            };
        }

        private static List<ArrayFilterDefinition> GetFilterFromRelation(string bbdd, string uid)
        {
            return new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument(new BsonElement("i.bbdd", bbdd))),
                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument( new BsonElement("j.uid", uid)))
            };
        }

        public async Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync()
        {
            var result = new Result<List<LexonEntityType>>(new List<LexonEntityType>());
            var filter = Builders<LexonMaster>.Filter.And(Builders<LexonMaster>.Filter.Gte(u => u.version, 9), Builders<LexonMaster>.Filter.Eq(u => u.type, "Entities"));
            TraceLog(parameters: new string[] { $"filter:{filter.ToString()}" });

            try
            {
                var master = await _context.LexonMasters
                    .Find(filter)
                    .FirstOrDefaultAsync();

                result.data = master?.list?.ToList();
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  obtener lista de tipos de entidad: {ex.Message}");
            }
            return result;
        }

        public async Task<Result<long>> AddClassificationToListAsync(ClassificationAddView actuation)
        {
            var result = new Result<long>(0);
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{actuation.idUser}", $"bbdd:{actuation.bbdd}", $"idMail:{actuation.listaMails}", $"idRelated:{actuation.idRelated}", $"idType:{actuation.idType}" });

            using (var session = await _context.StartSession(cancel))
            {
                session.StartTransaction();
                try
                {
                    await AddAndPublish(actuation, session, result);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    TraceInfo(result.infos, $"Error al añadir la actuacion de la entidad {actuation.idRelated} al usuario {actuation.idUser}: {ex.Message}");
                    session.AbortTransaction();
                }
            }
            return result;
        }

        private async Task AddAndPublish(ClassificationAddView actuation, IClientSessionHandle session, Result<long> result)
        {
            foreach (var mailData in actuation.listaMails)
            {
                var actua = new LexActuation
                {
                    date = mailData.Date,
                    entityIdType = (short)actuation.idType,
                    entityType = Enum.GetName(typeof(LexonAdjunctionType), actuation.idType),
                    idMail = mailData.Uid,
                    idRelated = (long)actuation.idRelated
                };

                var resultUpdate = await _context.LexUsersTransaction(session).UpdateOneAsync(
                     GetFilterLexUser(actuation.idUser),
                     Builders<LexUser>.Update.AddToSet($"companies.$[i].actuations", actua),
                     new UpdateOptions { ArrayFilters = GetFilterFromEntities(actuation.bbdd) }
                 );

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {actuation.idUser} añadiendo actuación");
                    result.data = resultUpdate.ModifiedCount;

                    var eventAssoc = new AssociateMailToEntityIntegrationEvent(_settings.Value.IdAppNavision, actuation.idUser, actua.entityType, actua.idRelated, mailData.Provider, mailData.MailAccount, mailData.Uid, mailData.Subject, mailData.Date);
                    await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                }
            }
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView actuation)
        {
            var result = new Result<long>(0);
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{actuation.idUser}", $"bbdd:{actuation.bbdd}", $"idMail:{actuation.idMail}", $"idRelated:{actuation.idRelated}", $"idType:{actuation.idType}" });

            using (var session = await _context.StartSession(cancel))
            {
                session.StartTransaction();
                try
                {
                    await RemoveAndPublish(actuation, session, result);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    TraceInfo(result.infos, $"Error al añadir la actuacion de la entidad {actuation.idRelated} al usuario {actuation.idUser}: {ex.Message}");
                    session.AbortTransaction();
                }
            }
            return result;
        }

        private async Task RemoveAndPublish(ClassificationRemoveView actuation, IClientSessionHandle session, Result<long> result)
        {
            var typeName = Enum.GetName(typeof(LexonAdjunctionType), actuation.idType);

            var resultUpdate = await _context.LexUsersTransaction(session).UpdateOneAsync(
                GetFilterLexUser(actuation.idUser),
                Builders<LexUser>.Update.Pull($"companies.$[i].actuations.$[j]", actuation.idMail),
                    new UpdateOptions
                    {
                        ArrayFilters = new List<ArrayFilterDefinition>
                            {
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.bbdd", actuation.bbdd)),
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", actuation.idMail))
                            }
                    }
            );

            if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
            {
                TraceInfo(result.infos, $"Se modifica el usuario {actuation.idUser} eliminando actuación");
                result.data = resultUpdate.ModifiedCount;

                var eventAssoc = new DissociateMailFromEntityIntegrationEvent(_settings.Value.IdAppNavision, actuation.idUser, typeName, (long)actuation.idRelated, actuation.Provider, actuation.MailAccount, actuation.idMail);
                await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
            }
        }

        public async Task<Result<List<LexActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail)
        {
            var result = new Result<List<LexActuation>>(new List<LexActuation>());
            var listaActuaciones = new List<LexActuation>();
            try
            {
                var options = new AggregateOptions() { AllowDiskUse = true, UseCursor = false };

                PipelineDefinition<LexUser, BsonDocument> pipeline = new BsonDocument[]
                    {
                    new BsonDocument("$match", new BsonDocument()
                        //.Add("idUser", idUser)
                        .Add("$or", new BsonArray
                                {
                                    new BsonDocument().Add("idUser", idUser),
                                    new BsonDocument().Add("idNavision", idUser)
                                })
                        .Add("companies.bbdd", bbdd)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("_id", 0)
                        .Add("companies.bbdd",1)
                        .Add("companies.entities",1)
                        .Add("companies.actuations",1)
                    ),
                    //new BsonDocument("$addFields", new BsonDocument()
                    //    .Add("companies.list.files.list.idType", 1)
                    //    .Add("companies.list.files.list.type", "Expedientes")
                    //    .Add("companies.list.clients.list.idType", 2)
                    //    .Add("companies.list.clients.list.type", "Clients")
                    //    .Add("companies.list.opposites.list.idType", 3)
                    //    .Add("companies.list.opposites.list.type", "Opposites")
                    //    .Add("companies.list.suppliers.list.idType", 4)
                    //    .Add("companies.list.suppliers.list.type", "Suppliers")
                    //    .Add("companies.list.lawyers.list.idType", 5)
                    //    .Add("companies.list.lawyers.list.type", "Lawyers")
                    //    .Add("companies.list.opposingLawyers.list.idType", 6)
                    //    .Add("companies.list.opposingLawyers.list.type", "OpposingLawyers")
                    //    .Add("companies.list.solicitors.list.idType", 7)
                    //    .Add("companies.list.solicitors.list.type", "Solicitors")
                    //    .Add("companies.list.opposingSolicitors.list.idType", 8)
                    //    .Add("companies.list.opposingSolicitors.list.type", "OpposingSolicitors")
                    //    .Add("companies.list.notaries.list.idType", 9)
                    //    .Add("companies.list.notaries.list.type", "Notaries")
                    //    .Add("companies.list.courts.list.idType", 10)
                    //    .Add("companies.list.courts.list.type", "Courts")
                    //    .Add("companies.list.insurances.list.idType", 11)
                    //    .Add("companies.list.insurances.list.type", "Insurances")
                    //),
                    new BsonDocument("$unwind", new BsonDocument()
                        .Add("path", "$companies")
                        .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    ),
                    new BsonDocument("$match", new BsonDocument()
                        .Add("companies.bbdd", bbdd)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("Classifications", new BsonDocument()
                            .Add("$setUnion", new BsonArray(
                                    new List<string>() {
                                        "$companies.list.files.list",
                                        "$companies.list.clients.list",
                                        "$companies.list.opposites.list",
                                        "$companies.list.suppliers.list",
                                        "$companies.list.insurances.list",
                                        "$companies.list.courts.list",
                                        "$companies.list.lawyers.list",
                                        "$companies.list.opposingLawyers.list",
                                        "$companies.list.solicitors.list",
                                        "$companies.list.opposingSolicitors.list",
                                        "$companies.list.notaries.list"
                                    }
                                )))
                    ),
                    new BsonDocument("$unwind", new BsonDocument()
                        .Add("path", "$Classifications")
                        .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    ),
                    new BsonDocument("$unwind", new BsonDocument()
                        .Add("path", "$Classifications.mails")
                        .Add("preserveNullAndEmptyArrays", new BsonBoolean(false))
                    ),
                    new BsonDocument("$match", new BsonDocument()
                        .Add("Classifications.mails", idMail)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("idMail", idMail)
                        .Add("idRelated", "$Classifications.id")
                        .Add("name", "$Classifications.name")
                        .Add("description", "$Classifications.description")
                        .Add("entityIdType", "$Classifications.idType")
                        .Add("entityType", "$Classifications.type")
                    )
                };

                TraceLog(parameters: new string[] { $"pipeline:{pipeline.ToString()}", $"options:{options.ToString()}" });

                var resultado = await _context.LexUsers.AggregateAsync(pipeline, options);

                using (var cursor = await _context.LexUsers.AggregateAsync(pipeline, options))
                {
                    while (await cursor.MoveNextAsync())
                    {
                        var batch = cursor.Current;
                        foreach (BsonDocument document in batch)
                        {
                            var actuation = BsonSerializer.Deserialize<LexActuation>(document);
                            TraceLog(parameters: new string[] { $"id:{actuation.idRelated}", $"Actuation:{actuation.name}" });
                            listaActuaciones.Add(actuation);
                        }
                    }
                }
                result.data = listaActuaciones;
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  actualizar relaciones de {idUser}: {ex.Message}");
            }
            return result;
        }

        public async Task<Result<bool>> UpsertUserAsync(Result<LexUser> lexUser)
        {
            var result = new Result<bool>();

            var filterUser = GetFilterLexUser(lexUser.data.idUser);

            try
            {
                var update = Builders<LexUser>.Update
                    .Set(x => x.idUser, lexUser.data.idUser)
                    .Set(x => x.idNavision, lexUser.data.idNavision)
                    .Set(x => x.version, 12)
                    .Set(x => x.name, lexUser.data.name);
                //.AddToSetEach(x => x.companies, lexUser.data.companies);

                var resultUpdate = await _context.LexUsers.UpdateOneAsync(
                    filterUser, update, new UpdateOptions { IsUpsert = true }
                );

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {lexUser.data.idUser}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.UpsertedId != null)
                {
                    TraceInfo(result.infos, $"Se crea un usuario {lexUser.data.idUser}");
                    result.data = resultUpdate.UpsertedId != null;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  actualizar usuario de {lexUser.data.idUser}: {ex.Message}");
            }

            return result;
        }

        public async Task<Result<bool>> UpsertCompaniesAsync(Result<LexUser> lexUser)
        {
            var result = new Result<bool>();
            var companiesToInsert = new List<LexCompany>();
            var filterUser = GetFilterLexUser(lexUser.data.idUser);

            try
            {
                var user = await _context.LexUsers.Find(filterUser).FirstOrDefaultAsync();

                if (user != null)
                {
                    foreach (var comp in lexUser.data.companies)
                    {
                        var companySearch = user.companies.Where(x => x.bbdd.Equals(comp.bbdd) && x.idCompany == comp.idCompany).Count();
                        if (companySearch == 0)
                        {
                            companiesToInsert.Add(comp);
                        }
                    }
                }

                var update = Builders<LexUser>.Update.AddToSetEach(x => x.companies, companiesToInsert?.ToArray());
                var resultUpdate = await _context.LexUsers.UpdateOneAsync(filterUser, update);

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {lexUser.data.idUser} añadiendo {companiesToInsert.Count} empresas");
                    result.data = true;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"fallo al  insertar o actualizar compañias para {lexUser.data.idUser}: {ex.Message}");
            }

            return result;
        }
    }
}