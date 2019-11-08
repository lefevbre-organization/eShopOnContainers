using Lexon.API.IntegrationsEvents.Events;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
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

        public UsersRepository(
              IOptions<LexonSettings> settings
            , IEventBus eventBus
            , ILogger<UsersRepository> logger

            ) : base(logger)
        {
            _context = new LexonContext(settings, eventBus);
        }

        public async Task<Result<List<LexonCompany>>> GetCompaniesListAsync(string idUser)
        {
            var result = new Result<List<LexonCompany>> { data = new List<LexonCompany>(), errors = new List<ErrorInfo>() };

            var filter = GetFilterUser(idUser);

            var fields = Builders<LexonUser>.Projection
                .Include("companies.list.idCompany")
                .Include("companies.list.conn")
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

        public async Task<Result<List<LexonUser>>> GetListAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<List<LexonUser>> { data = new List<LexonUser>(), errors = new List<ErrorInfo>() };
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

        public async Task<Result<long>> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
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

                    var company = user.companies.list.FirstOrDefault(x => x.idCompany == idCompany);

                    var builder = Builders<LexonUser>.Update;

                    var subitem = new LexonEntityBase
                    {
                        id = (int)idFile,
                        name = nameFile,
                        description = descriptionFile
                    };
                    var update = builder.Push("files", subitem);

                    var resultMongo = await _context.LexonUsers.UpdateOneAsync(filter, update);

                    var eventAssoc = new AddFileToUserIntegrationEvent(idUser, idCompany, idFile, nameFile, descriptionFile);
                    await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);

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
            var result = new Result<LexonUser> { errors = new List<ErrorInfo>() };
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

        public async Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, int idType, string idUser, long idCompany, string search)
        {
            var result = new Result<List<LexonEntityBase>> { data = new List<LexonEntityBase>(), errors = new List<ErrorInfo>() };
            var filterDocuments = FilterDefinition<LexonUser>.Empty;
            //if (!string.IsNullOrEmpty(search))
            //{
            //    filterDocuments = Builders<LexonUser>.Filter.Or(
            //        Builders<LexonUser>.Filter.Regex("Companies.list.Files.list.Name", $"/*{search}*/i"),
            //        Builders<LexonUser>.Filter.Regex("Companies.list.Files.list.Description", $"/*{search}*/i")
            //    );
            //}
            var filterUser = GetFilterUser(idUser);

            var filter = Builders<LexonUser>.Filter.And(
                filterUser,
                Builders<LexonUser>.Filter.Eq("companies.list.idCompany", idCompany),
                filterDocuments
                );

            TraceLog(parameters: new string[] { $"filter:{filter.ToString()}" });

            try
            {
                var user = await _context.LexonUsers
                    .Find(filter)
                    .SingleAsync();

                var company = user.companies.list.FirstOrDefault(x => x.idCompany == idCompany);
                if (!string.IsNullOrEmpty(search))
                {
                    var files = from s in company.files.list
                                where s.description.Contains(search) || s.name.Contains(search)
                                select s;
                    result.data = files.ToList();
                }

                var filesWithoutSearch = from s in company.files.list
                                         select s;
                long idFile = 1;
                foreach (var f in filesWithoutSearch)
                {
                    idFile += 1;
                    f.id = idFile;
                }

                result.data = filesWithoutSearch.ToList();
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync()
        {
            var result = new Result<List<LexonEntityType>> { data = new List<LexonEntityType>(), errors = new List<ErrorInfo>() };
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

        public async Task<Result<long>> AddClassificationToListAsync(string idUser, long idCompany, string[] listaMails, long idRelated, short idClassificationType = 1)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany:{idCompany}", $"idMail:{listaMails}", $"idRelated:{idRelated}", $"idClassificationType:{idClassificationType}" });

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);

                session.StartTransaction();
                try
                {
                    switch (idClassificationType)
                    {
                        case (short)LexonAssociationType.MailToFilesEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "files", session);
                            break;

                        case (short)LexonAssociationType.MailToClientsEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "clients", session);
                            break;

                        case (short)LexonAssociationType.MailToOppositesEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "opposites", session);
                            break;

                        case (short)LexonAssociationType.MailToSuppliersEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "suppliers", session);
                            break;

                        case (short)LexonAssociationType.MailToLawyersEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "lawyers", session);
                            break;

                        case (short)LexonAssociationType.MailToOpposingLawyersEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "opposingLawyers", session);
                            break;

                        case (short)LexonAssociationType.MailToSolicitorsEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "solicitors", session);
                            break;

                        case (short)LexonAssociationType.MailToOpposingSolicitorsEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "opposingSolicitors", session);
                            break;

                        case (short)LexonAssociationType.MailToNotariesEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "notaries", session);
                            break;

                        case (short)LexonAssociationType.MailToCourtsEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "courts", session);
                            break;

                        case (short)LexonAssociationType.MailToInsurancesEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "insurances", session);
                            break;

                        case (short)LexonAssociationType.MailToOthersEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "others", session);
                            break;

                        case (short)LexonAssociationType.MailToFoldersEvent:
                            await AddAndPublish(idUser, idCompany, listaMails, idRelated, "folders", session);
                            break;
                    }

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    result.data = idClassificationType;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction();
                }
            }
            return result;
        }

        private async Task AddAndPublish(string idUser, long idCompany, string [] listaMails, long idRelated, string typeCollection, IClientSessionHandle session)
        {
            TraceLog(parameters: new string[] { $"typeCollection:{typeCollection}" });

            foreach (var idMail in listaMails)
            {
                await _context.LexonUsersTransaction(session).UpdateOneAsync(
                    GetFilterUser(idUser),
                    Builders<LexonUser>.Update.AddToSet($"companies.list.$[i].{typeCollection}.list.$[j].mails", idMail),
                    new UpdateOptions
                    {
                        ArrayFilters = new List<ArrayFilterDefinition>
                            {
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany)),
                                new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", idRelated))
                            }
                    }
                );

                var eventAssoc = new AssociateMailToFileIntegrationEvent(idUser, idRelated, idMail);
                await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
            }

        }

        private async Task RemoveAndPublish(string idUser, long idCompany, string idMail, long idRelated, string typeCollection, IClientSessionHandle session)
        {
            TraceLog(parameters: new string[] { $"typeCollection:{typeCollection}" });

            await _context.LexonUsersTransaction(session).UpdateOneAsync(
                GetFilterUser(idUser),
                Builders<LexonUser>.Update.Pull($"companies.list.$[i].{typeCollection}.list.$[j].mails", idMail),
                new UpdateOptions
                {
                    ArrayFilters = new List<ArrayFilterDefinition>
                        {
                            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany)),
                            new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.id", idRelated))
                        }
                }
            );

            var eventAssoc = new AssociateMailToFileIntegrationEvent(idUser, idRelated, idMail);
            await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
        }

        public async Task<Result<long>> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            var cancel = default(CancellationToken);
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany:{idCompany}", $"idMail:{idMail}", $"idRelated:{idRelated}", $"idClassificationType:{idClassificationType}" });

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);

                session.StartTransaction();
                try
                {
                    switch (idClassificationType)
                    {
                        case (short)LexonAssociationType.MailToFilesEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "files", session);
                            break;

                        case (short)LexonAssociationType.MailToClientsEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "clients", session);
                            break;

                        case (short)LexonAssociationType.MailToOppositesEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "opposites", session);
                            break;

                        case (short)LexonAssociationType.MailToSuppliersEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "suppliers", session);
                            break;

                        case (short)LexonAssociationType.MailToLawyersEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "lawyers", session);
                            break;

                        case (short)LexonAssociationType.MailToOpposingLawyersEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "opposingLawyers", session);
                            break;

                        case (short)LexonAssociationType.MailToSolicitorsEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "solicitors", session);
                            break;

                        case (short)LexonAssociationType.MailToOpposingSolicitorsEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "opposingSolicitors", session);
                            break;

                        case (short)LexonAssociationType.MailToNotariesEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "notaries", session);
                            break;

                        case (short)LexonAssociationType.MailToCourtsEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "courts", session);
                            break;

                        case (short)LexonAssociationType.MailToInsurancesEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "insurances", session);
                            break;

                        case (short)LexonAssociationType.MailToOthersEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "others", session);
                            break;

                        case (short)LexonAssociationType.MailToFoldersEvent:
                            await RemoveAndPublish(idUser, idCompany, idMail, idRelated, "folders", session);
                            break;
                    }

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    result.data = idClassificationType;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction();
                }
            }
            return result;
        }

        public async Task<Result<long>> SelectCompanyAsync(string idUser, long idCompany)
        {
            TraceLog(parameters: new string[] { $"idUser:{idUser}", $"idCompany:{idCompany}" });

            var result = new Result<long> { errors = new List<ErrorInfo>() };

            try
            {
                var resultMongo = await _context.LexonUsers.UpdateOneAsync(
                   GetFilterUser(idUser),
                   Builders<LexonUser>.Update.Set("companies.list.$[i].selected", true),
                   new UpdateOptions
                   {
                       ArrayFilters = new List<ArrayFilterDefinition>
                       {
                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany))
                       }
                   }
                );
                if (resultMongo.IsAcknowledged)
                    result.data = resultMongo.ModifiedCount;
                else
                    TraceOutputMessage(result.errors, "Error in Update MongoDB", 1001);

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            var result = new Result<List<LexonActuation>> { data = new List<LexonActuation>(), errors = new List<ErrorInfo>() };
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
                        .Add("companies.list.idCompany", idCompany)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("_id", 0)
                        .Add("companies.list.idCompany",1)
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
                        .Add("companies.list.idCompany", idCompany)
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