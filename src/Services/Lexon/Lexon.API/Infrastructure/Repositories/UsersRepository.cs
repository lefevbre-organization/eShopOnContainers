using Lexon.API.IntegrationsEvents.Events;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
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
    public class UsersRepository : IUsersRepository
    {
        private readonly LexonContext _context;

        public UsersRepository(
            IOptions<LexonSettings> settings,
            IEventBus eventBus
            )
        {
            _context = new LexonContext(settings, eventBus);
        }

        public async Task<List<LexonCompany>> GetCompaniesListAsync(string idUser)
        {
            var filter = GetFilterUser(idUser);

            var fields = Builders<LexonUser>.Projection
                .Include("companies.list.idCompany")
                .Include("companies.list.conn")
                .Include("companies.list.name");

            var user = await _context.LexonUsers
                        .Find(filter)
                        .Project<LexonUser>(fields)
                        .FirstOrDefaultAsync();

            var companies = user?.companies?.list?.ToList();
            return companies ?? new List<LexonCompany>();
        }

        private static FilterDefinition<LexonUser> GetFilterUser(string idUser)
        {
            return Builders<LexonUser>.Filter.Or(
                Builders<LexonUser>.Filter.Eq(u => u.idUser, idUser),
                Builders<LexonUser>.Filter.Eq(u => u.idNavision, idUser)
                );
        }

        public async Task<List<LexonUser>> GetListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = GetFilterUser(idUser);

            return await _context.LexonUsers
                .Find(filter)
                .Skip(pageIndex * pageSize)
                .Limit(pageSize)
                .ToListAsync();
        }

        private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        {
            var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
            await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
            await _context.PublishThroughEventBusAsync(eventAssoc, session);
        }

        public async Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        {
            //todo: hacer método para desclasificar mail
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    var filter = GetFilterUser(idUser);
                    var user = await _context.LexonUsers
                        .Find(filter)
                        .SingleAsync();

                    var company = user.companies.list.FirstOrDefault(x => x.idCompany == idCompany);

                    var builder = Builders<LexonUser>.Update;
                    //var builder = Builders<LexonCompany>.Update;
                    var subitem = new LexonEntityBase
                    {
                        id = (int)idFile,
                        name = nameFile,
                        description = descriptionFile
                    };
                    var update = builder.Push("files", subitem);

                    var result = await _context.LexonUsers.UpdateOneAsync(filter, update);

                    var eventAssoc = new AddFileToUserIntegrationEvent(idUser, idCompany, idFile, nameFile, descriptionFile);
                    await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    return result.ModifiedCount;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    session.AbortTransaction(cancel);
                    return 0;
                }
            }
        }

        public async Task<LexonUser> GetAsync(string idUser)
        {
            var filter = GetFilterUser(idUser);
            return await _context.LexonUsers.Find(filter).SingleAsync();
        }

        public async Task<List<LexonEntityBase>> GetEntitiesListAsync(int pageSize, int pageIndex, int idType, string idUser, long idCompany, string search)
        {
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

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            var company = user.companies.list.FirstOrDefault(x => x.idCompany == idCompany);
            if (!string.IsNullOrEmpty(search))
            {
                var files = from s in company.files.list
                            where s.description.Contains(search) || s.name.Contains(search)
                            select s;
                return files.ToList();
            }

            var filesWithoutSearch = from s in company.files.list
                                     select s;
            return filesWithoutSearch.ToList();
        }

        public async Task<List<LexonEntityType>> GetClassificationMasterListAsync()
        {
            var lexonEntities = new List<LexonEntityType>();
            var filter = Builders<LexonMaster>.Filter.And(Builders<LexonMaster>.Filter.Gte(u => u.version, 9), Builders<LexonMaster>.Filter.Eq(u => u.type, "Entities"));
            var master = await _context.LexonMasters
                .Find(filter)
                .FirstOrDefaultAsync();

            lexonEntities = master?.list?.ToList();
            return lexonEntities;
        }

        public async Task<long> AddClassificationToListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            var cancel = default(CancellationToken);
            var raiseAssociateMailToFileEvent = idClassificationType == 1; // type == "File";
            var raiseAssociateMailToClientEvent = idClassificationType == 2; //type == "Client";
            var raiseAssociateMailToDocumentEvent = idClassificationType == 3; //type == "Document";

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);

                session.StartTransaction();
                try
                {
                    if (raiseAssociateMailToFileEvent)
                    {
                        await _context.LexonUsersTransaction(session).UpdateOneAsync(
                            GetFilterUser(idUser),
                            Builders<LexonUser>.Update.AddToSet("Companies.list.$[i].Files.list.$[j].mails", idMail),
                            new UpdateOptions
                            {
                                ArrayFilters = new List<ArrayFilterDefinition>
                                {
                                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany)),
                                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.idFile", idRelated))
                                }
                            });

                        var eventAssoc = new AssociateMailToFileIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }
                    else if (raiseAssociateMailToClientEvent)
                    {
                        var eventAssoc = new AssociateMailToClientIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }
                    else if (raiseAssociateMailToDocumentEvent)
                    {
                        var eventAssoc = new AssociateMailToDocumentIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    return 1;
                }
                catch (Exception e)

                {
                    Console.WriteLine(e.Message);
                    session.AbortTransaction();
                    return 0;
                }
            }
        }

        public async Task<long> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType)
        {
            var cancel = default(CancellationToken);
            var raiseAssociateMailToFileEvent = idClassificationType == 1; // type == "File";
            var raiseAssociateMailToClientEvent = idClassificationType == 2; //type == "Client";
            var raiseAssociateMailToDocumentEvent = idClassificationType == 3; //type == "Document";

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    if (raiseAssociateMailToFileEvent)
                    {
                        await _context.LexonUsersTransaction(session).UpdateOneAsync(
                            GetFilterUser(idUser),
                            Builders<LexonUser>.Update.Pull("companies.list.$[i].files.list.$[j].mails", idMail),
                            new UpdateOptions
                            {
                                ArrayFilters = new List<ArrayFilterDefinition>
                                {
                                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany)),
                                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("j.idFile", idRelated))
                                }
                            });

                        var eventAssoc = new AssociateMailToFileIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }
                    else if (raiseAssociateMailToClientEvent)
                    {
                        var eventAssoc = new AssociateMailToClientIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }
                    else if (raiseAssociateMailToDocumentEvent)
                    {
                        var eventAssoc = new AssociateMailToDocumentIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }

                    await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
                    return 1;
                }
                catch (Exception e)

                {
                    Console.WriteLine(e.Message);
                    session.AbortTransaction();
                    return 0;
                }
            }
        }

        public async Task<bool> SelectCompanyAsync(string idUser, long idCompany)
        {
            await _context.LexonUsers.UpdateOneAsync(
                GetFilterUser(idUser),
                Builders<LexonUser>.Update.Set("companies.list.$[i].selected", true),
                new UpdateOptions
                {
                    ArrayFilters = new List<ArrayFilterDefinition>
                    {
                         new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany))
                    }
                });
            return true;
        }

        public async Task<List<LexonActuation>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
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

                var resultado = await _context.LexonUsers.AggregateAsync(pipeline, options);

                using (var cursor = await _context.LexonUsers.AggregateAsync(pipeline, options))
                {
                    while (await cursor.MoveNextAsync())
                    {
                        var batch = cursor.Current;
                        foreach (BsonDocument document in batch)
                        {
                            var actuation = BsonSerializer.Deserialize<LexonActuation>(document);
                            listaActuaciones.Add(actuation);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }

            return listaActuaciones;
        }
    }
}