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

        public async Task<Result<List<LexonCompany>>> GetCompaniesListAsync(string idUser)
        {
            var result = new Result<List<LexonCompany>>(new List<LexonCompany>());

            var filter = GetFilterUser(idUser);

            var fields = Builders<LexonUser>.Projection
                .Include("companies.list.idCompany")
                .Include("companies.list.bbdd")
                .Include("companies.list.name");

            TraceLog(parameters: new string[] { $"fields:{fields.ToString()}", $"filter:{filter.ToString()}" });

            try
            {
                var user = await _context.LexonUsers
                            .Find(filter)
                            .Project<LexonUser>(fields)
                            .FirstOrDefaultAsync();

                var companies = user?.companies?.list?.ToList();
                result.data = companies ?? new List<LexonCompany>();
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        private static FilterDefinition<LexonUser> GetFilterUser(string idUser)
        {
            return Builders<LexonUser>.Filter.Or(
                Builders<LexonUser>.Filter.Eq(u => u.idUser, idUser),
                Builders<LexonUser>.Filter.Eq(u => u.idNavision, idUser)
                );
        }

        private static FilterDefinition<LexUser> GetFilterLexUser(string idUser)
        {
            return Builders<LexUser>.Filter.Or(
                Builders<LexUser>.Filter.Eq(u => u.idUser, idUser),
                Builders<LexUser>.Filter.Gte(u => u.version, 11)
                );
        }

        public async Task<Result<List<LexonUser>>> GetListAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<List<LexonUser>>(new List<LexonUser>());
            var filter = GetFilterUser(idUser);

            TraceLog(parameters: new string[] { $"filter:{filter.ToString()}" });

            try
            {
                result.data = await _context.LexonUsers
                    .Find(filter)
                    .Skip(pageIndex * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        {
            var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
            await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
            await _context.PublishThroughEventBusAsync(eventAssoc, session);
        }

        public async Task<Result<long>> AddFileToListAsync(string idUser, string bbdd, long idFile, string nameFile, string descriptionFile = "")
        {
            long a = 0;
            var result = new Result<long>(a);
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    var filter = GetFilterUser(idUser);
                    TraceLog(parameters: new string[] { $"filter:{filter.ToString()}" });

                    var user = await _context.LexonUsers
                        .Find(filter)
                        .SingleAsync();

                    var company = user.companies.list.FirstOrDefault(x => x.bbdd.Contains(bbdd));

                    var builder = Builders<LexonUser>.Update;

                    var subitem = new LexonEntityBase
                    {
                        id = (int)idFile,
                        name = nameFile,
                        description = descriptionFile
                    };
                    var update = builder.Push("files", subitem);

                    var resultMongo = await _context.LexonUsers.UpdateOneAsync(filter, update);

                    // var eventAssoc = new AddFileToUserIntegrationEvent(idUser, bbdd, idFile, nameFile, descriptionFile);
                    // await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);

                    if (resultMongo.IsAcknowledged)
                        result.data = resultMongo.ModifiedCount;
                    else
                        TraceOutputMessage(result.errors, "Error in Insert MongoDB", 1002);
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction(cancel);
                }
            }
            return result;
        }

        public async Task<Result<LexonUser>> GetAsync(string idUser)
        {
            var result = new Result<LexonUser>(new LexonUser());
            var filter = GetFilterUser(idUser);
            try
            {
                result.data = await _context.LexonUsers.Find(filter).SingleAsync();
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView search)
        {
            var resultMongo = new MySqlCompany();

            try
            {
                var filterUser = GetFilterLexUser(search.idUser);
                TraceLog(parameters: new string[] { $"filter:{filterUser.ToString()}" });
                
                var user = await _context.LexUsers
                    .Find(filterUser)
                    .FirstOrDefaultAsync();

                var company = user.companies.FirstOrDefault(x => x.bbdd.Contains(search.bbdd));

                var entitiesSearch = company.entities.Where
                    (ent =>
                        (ent.idType == search.idType)
                      //  && (search.search != null && (ent.description.Contains(search.search) || ent.code.Contains(search.search) || ent.email.Contains(search.search)))
                    );

                var entidades = entitiesSearch.ToArray();

                company.entities = entidades;
                resultMongo.AddData(company);
            }
            catch (Exception ex)
            {
                TraceMessage(resultMongo.Errors, ex);
            }
            return resultMongo;
        }

        public async Task<Result<bool>> UpsertEntitiesAsync(EntitySearchView search, MySqlCompany resultMySql)
        {
            var result = new Result<bool>();

            var filterUser = GetFilterLexUser(search.idUser);

            try
            {
                var arrayFiltersSimple = GetFilterFromEntities(search.bbdd);

                var resultUpdate = await _context.LexUsers.UpdateOneAsync(
                    filterUser,
                    Builders<LexUser>.Update
                        .AddToSetEach($"companies.$[i].entities", resultMySql.Data.ToArray()),
                        new UpdateOptions { ArrayFilters = arrayFiltersSimple, IsUpsert = true }
                );

                //foreach (var newEntity in resultMySql.Data)
                //{
                //    var arrayFilters = GetFilterFromEntity(search.bbdd, newEntity.idType, newEntity.idRelated);
                //    resultUpdate = await _context.LexUsers.UpdateOneAsync(
                //        filterUser,
                //        Builders<LexUser>.Update
                //            .AddToSet($"companies.$[i].entities.$[j]", newEntity),
                //            new UpdateOptions { ArrayFilters = arrayFilters, IsUpsert= true }
                //    );

                //    if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                //    {
                //        TraceInfo(result.infos, $"Se modifica el usuario {search.idUser} añadiendo la entidad {newEntity.code}-{newEntity.description} de tipo: {newEntity.entityType}");
                //        result.data = resultUpdate.ModifiedCount > 0;
                //    }
                //}

                if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {search.idUser} añadiendo varias entidades {resultUpdate.ModifiedCount} de tipo: {search.idType}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
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

        private static FilterDefinition<LexEntity> GetFilterIdRelated(EntitySearchView search)
        {
            //if (search.idFilter != null)
            //    return Builders<LexEntity>.Filter.Eq(x => x.idRelated, search.idFilter);
            return FilterDefinition<LexEntity>.Empty;
        }

        private static FilterDefinition<LexEntity> GetFilterSearch(EntitySearchView search)
        {
            if (search.search != null)
                return Builders<LexEntity>.Filter.Eq(x => x.description, search.search);
            return FilterDefinition<LexEntity>.Empty;
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
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        //  public async Task<Result<long>> AddClassificationToListAsync(string idUser, string bbdd, string[] listaMails, long idRelated, short? idClassificationType = 1)
        public async Task<Result<long>> AddClassificationToListAsync(string idUser, string bbdd, MailInfo[] listaMails, long idRelated, short? idClassificationType = 1)
        {
            long a = 0;
            var result = new Result<long>(a);
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"bbdd:{bbdd}", $"idMail:{listaMails}", $"idRelated:{idRelated}", $"idClassificationType:{idClassificationType}" });

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);

                session.StartTransaction();
                try
                {
                    var entityTypename = Enum.GetName(typeof(LexonAdjunctionType), idClassificationType);
                    await AddAndPublish(_settings.Value.IdAppNavision, idUser, bbdd, listaMails, idRelated, entityTypename, session);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    result.data = (short)idClassificationType;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction();
                }
            }
            return result;
        }

        private async Task AddAndPublish(long idAppNav, string idUser, string bbdd, MailInfo[] listaMails, long idRelated, string typeCollection, IClientSessionHandle session)
        {
            TraceLog(parameters: new string[] { $"typeCollection:{typeCollection}" });

            foreach (var mailData in listaMails)
            {
                await _context.LexonUsersTransaction(session).UpdateOneAsync(
                    GetFilterUser(idUser),
                    Builders<LexonUser>.Update.AddToSet($"companies.list.$[i].{typeCollection}.list.$[j].mails", mailData),
                    new UpdateOptions
                    {
                        ArrayFilters = new List<ArrayFilterDefinition>
                            {
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.bbdd", bbdd)),
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", idRelated))
                            }
                    }
                );

                var eventAssoc = new AssociateMailToEntityIntegrationEvent(idAppNav, idUser, typeCollection, idRelated, mailData.Provider, mailData.MailAccount, mailData.Uid, mailData.Subject, mailData.Date);
                await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
            }
        }

        private async Task RemoveAndPublish(long idAppNav, string idUser, string bbdd, string provider, string emailAccount, string uidMail, long idRelated, string typeCollection, IClientSessionHandle session)
        {
            TraceLog(parameters: new string[] { $"typeCollection:{typeCollection}" });

            //TODO: corregir el eliminado de datos para que busque la correcta
            await _context.LexonUsersTransaction(session).UpdateOneAsync(
                GetFilterUser(idUser),
                Builders<LexonUser>.Update.Pull($"companies.list.$[i].{typeCollection}.list.$[j].mails", uidMail),
                new UpdateOptions
                {
                    ArrayFilters = new List<ArrayFilterDefinition>
                        {
                            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.bbdd", bbdd)),
                            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", idRelated))
                        }
                }
            );

            var eventAssoc = new DissociateMailFromEntityIntegrationEvent(idAppNav, idUser, typeCollection, idRelated, provider, emailAccount, uidMail);
            await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(string idUser, string bbdd, string provider, string mailAccount, string uidMail, long idRelated, short? idClassificationType)
        {
            long a = 0;
            var result = new Result<long>(a);
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"bbdd:{bbdd}", $"idMail:{uidMail}", $"idRelated:{idRelated}", $"idClassificationType:{idClassificationType}" });

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);

                session.StartTransaction();
                try
                {
                    var entityTypename = Enum.GetName(typeof(LexonAdjunctionType), idClassificationType);
                    await RemoveAndPublish(_settings.Value.IdAppNavision, idUser, bbdd, provider, mailAccount, uidMail, idRelated, entityTypename, session);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    result.data = (short)idClassificationType;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction();
                }
            }
            return result;
        }

        public async Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail)
        {
            var result = new Result<List<LexonActuation>>(new List<LexonActuation>());
            var listaActuaciones = new List<LexonActuation>();
            try
            {
                var options = new AggregateOptions() { AllowDiskUse = true, UseCursor = false };

                PipelineDefinition<LexonUser, BsonDocument> pipeline = new BsonDocument[]
                    {
                    new BsonDocument("$match", new BsonDocument()
                        //.Add("idUser", idUser)
                        .Add("$or", new BsonArray
                                {
                                    new BsonDocument().Add("idUser", idUser),
                                    new BsonDocument().Add("idNavision", idUser)
                                })
                        .Add("companies.list.bbdd", bbdd)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("_id", 0)
                        .Add("companies.list.bbdd",1)
                        .Add("companies.list.files.list",1)
                        .Add("companies.list.clients.list",1)
                        .Add("companies.list.opposites.list",1)
                        .Add("companies.list.suppliers.list",1)
                        .Add("companies.list.insurances.list",1)
                        .Add("companies.list.courts.list",1)
                        .Add("companies.list.lawyers.list",1)
                        .Add("companies.list.opposingLawyers.list",1)
                        .Add("companies.list.solicitors.list",1)
                        .Add("companies.list.opposingSolicitors.list",1)
                        .Add("companies.list.notaries.list",1)
                    ),
                    new BsonDocument("$addFields", new BsonDocument()
                        .Add("companies.list.files.list.idType", 1)
                        .Add("companies.list.files.list.type", "Expedientes")
                        .Add("companies.list.clients.list.idType", 2)
                        .Add("companies.list.clients.list.type", "Clients")
                        .Add("companies.list.opposites.list.idType", 3)
                        .Add("companies.list.opposites.list.type", "Opposites")
                        .Add("companies.list.suppliers.list.idType", 4)
                        .Add("companies.list.suppliers.list.type", "Suppliers")
                        .Add("companies.list.lawyers.list.idType", 5)
                        .Add("companies.list.lawyers.list.type", "Lawyers")
                        .Add("companies.list.opposingLawyers.list.idType", 6)
                        .Add("companies.list.opposingLawyers.list.type", "OpposingLawyers")
                        .Add("companies.list.solicitors.list.idType", 7)
                        .Add("companies.list.solicitors.list.type", "Solicitors")
                        .Add("companies.list.opposingSolicitors.list.idType", 8)
                        .Add("companies.list.opposingSolicitors.list.type", "OpposingSolicitors")
                        .Add("companies.list.notaries.list.idType", 9)
                        .Add("companies.list.notaries.list.type", "Notaries")
                        .Add("companies.list.courts.list.idType", 10)
                        .Add("companies.list.courts.list.type", "Courts")
                        .Add("companies.list.insurances.list.idType", 11)
                        .Add("companies.list.insurances.list.type", "Insurances")
                    ),
                    new BsonDocument("$unwind", new BsonDocument()
                        .Add("path", "$companies.list")
                        .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    ),
                    new BsonDocument("$match", new BsonDocument()
                        .Add("companies.list.bbdd", bbdd)
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

                var resultado = await _context.LexonUsers.AggregateAsync(pipeline, options);

                using (var cursor = await _context.LexonUsers.AggregateAsync(pipeline, options))
                {
                    while (await cursor.MoveNextAsync())
                    {
                        var batch = cursor.Current;
                        foreach (BsonDocument document in batch)
                        {
                            var actuation = BsonSerializer.Deserialize<LexonActuation>(document);
                            TraceLog(parameters: new string[] { $"id:{actuation.idRelated}", $"Actuation:{actuation.name}" });
                            listaActuaciones.Add(actuation);
                        }
                    }
                }
                result.data = listaActuaciones;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }
    }
}