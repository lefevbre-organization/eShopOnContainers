﻿using Lexon.API.IntegrationsEvents.Events;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
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
                .Include("Companies.list.idCompany")
                .Include("Companies.list.conn")
                .Include("Companies.list.name");

            var user = await _context.LexonUsers
                        .Find(filter)
                        .Project<LexonUser>(fields)
                        .FirstOrDefaultAsync();

            var companies = user?.Companies?.List?.ToList();
            return companies ?? new List<LexonCompany>(); 
        }

        private static FilterDefinition<LexonUser> GetFilterUser(string idUser)
        {
            return Builders<LexonUser>.Filter.Or(
                Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser),
                Builders<LexonUser>.Filter.Eq(u => u.IdNavision, idUser)
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

        #region PublishEvents

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

                    var company = user.Companies.List.FirstOrDefault(x => x.IdCompany == idCompany);

                    var builder = Builders<LexonUser>.Update;
                    //var builder = Builders<LexonCompany>.Update;
                    var subitem = new LexonFile
                    {
                        IdFile = (int)idFile,
                        Name = nameFile,
                        Description = descriptionFile
                    };
                    var update = builder.Push("Files", subitem);

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

        public async Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser, long idCompany, string search)
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
                Builders<LexonUser>.Filter.Eq("Companies.list.idCompany", idCompany),
                filterDocuments
                );

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            var company = user.Companies.List.FirstOrDefault(x => x.IdCompany == idCompany);
            if (!string.IsNullOrEmpty(search))
            {
                var files = from s in company.Files.List
                            where s.Description.Contains(search) || s.Name.Contains(search)
                            select s;
                return files.ToList();
            }

            var filesWithoutSearch = from s in company.Files.List
                                     select s;
            return filesWithoutSearch.ToList();
        }

        public async Task<List<LexonEntity>> GetClassificationMasterListAsync()
        {
            var filter = Builders<LexonUser>.Filter.Gte(u => u.Version, 7);
            var user = await _context.LexonUsers
                .Find(filter).FirstAsync();
            return user.Masters.Entities.List.ToList();
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
                            Builders<LexonUser>.Update.Pull("Companies.list.$[i].Files.list.$[j].mails", idMail),
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
                Builders<LexonUser>.Update.Set("Companies.list.$[i].selected", true),
                new UpdateOptions
                {
                    ArrayFilters = new List<ArrayFilterDefinition>
                    {
                         new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.idCompany", idCompany))
                    }
                });
            return true;
        }

        public async Task<LexonActuationMailList> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            try
            {
                var options = new AggregateOptions()
                {
                    AllowDiskUse = true,
                    UseCursor = false
                };

                var array = new BsonArray
                {
                    new BsonDocument().Add("idUser", idUser),
                    new BsonDocument().Add("idNavision", idUser)
                };

                var arrayOfArrays = new BsonArray(new List<string>() { "$Companies.list.Files.list", "$Companies.list.Clients.list" });
                 

                PipelineDefinition<LexonUser, BsonDocument> pipeline = new BsonDocument[]
                {

                    new BsonDocument("$match", new BsonDocument()
                        .Add("idUser", idUser)
                        .Add("$or", array)
                        .Add("Companies.list.idCompany", idCompany)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("_id", 0)
                        .Add("Companies.list.idCompany",1)
                        .Add("Companies.list.Files.list",1)
                        .Add("Companies.list.Clients.list",1)
                        .Add("Companies.list.Insurances.list",1)
                        .Add("Companies.list.Suppliers.list",1)
                        .Add("Companies.list.Courts.list",1)
                        .Add("Companies.list.Lawyers.list",1)
                        .Add("Companies.list.Solicitors.list",1)
                        .Add("Companies.list.Notaries.list",1)
                        //.Add("Companies.list.Folders.list",1)
                        //.Add("Companies.list.Folders.list.Documents",0)
                    ),
                    new BsonDocument("$addFields", new BsonDocument()
                        .Add("Companies.list.Files.list.idType", 1)
                        .Add("Companies.list.Files.list.Type", "Expedientes")
                        .Add("Companies.list.Clients.list.idType", 2)
                        .Add("Companies.list.Clients.list.Type", "Clients")
                        .Add("Companies.list.Insurances.list.idType", 11)
                        .Add("Companies.list.Insurances.list.Type", "Insurances")
                        .Add("Companies.list.Suppliers.list.idType", 4)
                        .Add("Companies.list.Suppliers.list.Type", "Suppliers")
                        .Add("Companies.list.Courts.list.idType", 10)
                        .Add("Companies.list.Courts.list.Type", "Courts")
                        .Add("Companies.list.Lawyers.list.idType", 5)
                        .Add("Companies.list.Lawyers.list.Type", "Lawyers")
                        .Add("Companies.list.Solicitors.list.idType", 7)
                        .Add("Companies.list.Solicitors.list.Type", "Solicitors")
                        .Add("Companies.list.Notaries.list.idType", 9)
                        .Add("Companies.list.Notaries.list.Type", "Notaries")
                        ),
                    new BsonDocument("$unwind", new BsonDocument()
                        .Add("path", "$Companies.list")
                        .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))),
                    new BsonDocument("$match", new BsonDocument()
                        .Add("Companies.list.idCompany", idCompany)
                    ),
                    new BsonDocument("$project", new BsonDocument()
                        .Add("Classifications", new BsonDocument()                  
                            .Add("$setUnion", arrayOfArrays))
                        ),
                    //new BsonDocument("$unwind", new BsonDocument()
                    //    .Add("path", "$Companies.list.Files.list")
                    //    .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    //    ),
                    //new BsonDocument("$unwind", new BsonDocument()
                    //    .Add("path", "$Companies.list.Files.list.mails")
                    //    .Add("preserveNullAndEmptyArrays", new BsonBoolean(false))
                    //    ),
                    //new BsonDocument("$unwind", new BsonDocument()
                    //    .Add("path", "$Companies.list.Clients.list")
                    //    .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    //    ),
                    //new BsonDocument("$unwind", new BsonDocument()
                    //    .Add("path", "$Companies.list.Clients.list.mails")
                    //    .Add("preserveNullAndEmptyArrays", new BsonBoolean(true))
                    //    ),
                    //new BsonDocument("$project", new BsonDocument()
                    //    .Add("idMail", "$Companies.list.Files.list.mails")
                    //    .Add("name", "$Companies.list.Files.list.code")
                    //    .Add("description", "$Companies.list.Files.list.description")
                    //    .Add("idType", "$Companies.list.Files.list.idType")
                    //    .Add("Type", "$Companies.list.Files.list.Type")
                    //    //.Add("Clients.idMail", "$Companies.list.Files.list.mails")
                    //    //.Add("Clients.name", "$Companies.list.Clients.list.code")
                    //    //.Add("Clients.description", "$Companies.list.Clients.list.description")
                    //    //.Add("Clients.idType", "$Companies.list.Clients.list.idType")
                    //    //.Add("Clients.Type", "$Companies.list.Clients.list.Type")
                    //    ),
                    //new BsonDocument("$match", new BsonDocument()
                    //    .Add("idMail", idMail)
                    //),
                    //new BsonDocument("$group", new BsonDocument()
                    //    //.Add("_id", "$idMail")
                    //    .Add("_id", new BsonDocument()
                    //        .Add("idMail", "$idMail")
                    //        .Add("Type", "$Type")
                    //    )
                    //    //.Add("Classifications", new BsonDocument().Add("$push", "$$ROOT"))
                    //    .Add("Classifications", new BsonDocument()
                    //        .Add("$push", new BsonDocument()
                    //            .Add("name", "$name")
                    //            .Add("description", "$description")
                    //            .Add("idType", "$idType")
                    //            .Add("Clients", "$Clients")
                    //            )
                    //       )
                    //    ),
                    //new BsonDocument("$addFields", new BsonDocument()
                    //    .Add("timestamp", DateTime.Now.Ticks)
                    //    ),
                };

                var resultado = await _context.LexonUsers.AggregateAsync(pipeline, options);
                using (var cursor = await _context.LexonUsers.AggregateAsync(pipeline, options))
                {
                    while (await cursor.MoveNextAsync())
                    {
                        var batch = cursor.Current;
                        foreach (BsonDocument document in batch)
                        {
                            Console.WriteLine($"S/N: {document.ToString()}");
                        }
                    }
                }
                //return result;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            //var user = await _context.LexonUsers.Aggregate<LexonUser>(pipeline).ForEachAsync(
            //    resultado =>
            //    {
            //        Console.WriteLine($"S/N: {resultado.ToString()}");
            //    });

            var cla = new LexonActuationMailList();
            cla.IdMail = idMail;

            //var company = user.Companies.List.FirstOrDefault(x => x.IdCompany == idCompany);

            //todo: hacer procedimiento para buscar los datos de clasificaciones en mongo
            return new LexonActuationMailList();
        }

        #endregion PublishEvents
    }
}