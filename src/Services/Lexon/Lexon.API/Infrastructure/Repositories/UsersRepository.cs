using Lexon.API.IntegrationsEvents.Events;
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

        public async Task<LexonUser> GetAsync(int idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(nameof(idUser), idUser);
            return await _context.LexonUsers
                .Find(filter)
                .FirstOrDefaultAsync();
        }

        public async Task<List<LexonCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
            var fields = Builders<LexonUser>.Projection
                .Exclude("Companies.List.Clients")
                .Exclude("Companies.List.Insurances")
                .Exclude("Companies.List.Suppliers")
                .Exclude("Companies.List.Courts")
                .Exclude("Companies.List.Files")
                .Exclude("Companies.List.Lawyers")
                .Exclude("Companies.List.Solicitors")
                .Exclude("Companies.List.Notaries")
                .Exclude("Companies.List.Folders");

            var user = await _context.LexonUsers
                        .Find(filter)
                        .Project<LexonUser>(fields)
                        .SingleAsync();

            return user.Companies.List.Take(pageSize).ToList();
        }

        public async Task<List<LexonUser>> GetListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            return await _context.LexonUsers
                .Find(filter)
                .Skip(pageIndex * pageSize)
                .Limit(pageSize)
                .ToListAsync();
        }

        #region PublishEvents

        private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        {
            //TODO:revisar el guid para quitarlo
            var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
            await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
            await _context.PublishThroughEventBusAsync(eventAssoc, session);
        }

        //public async Task<long> AddFileToListInDocumentAsync(string idUser, long idFile, string nameFile, string descriptionFile = "")
        //{
        //    var cancel = default(CancellationToken);
        //    using (var session = await _context.StartSession(cancel))
        //    {
        //        //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
        //        //session.StartTransaction(transactionOptions);
        //        session.StartTransaction();
        //        try
        //        {
        //            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
        //            var user = await _context.LexonUsers
        //                .Find(filter)
        //                .SingleAsync();

        //            var builder = Builders<LexonUser>.Update;
        //            var subitem = new LexonFile
        //            {
        //                IdFile = (int)idFile,
        //                Name = nameFile,
        //                Description = descriptionFile
        //            };
        //            var update = builder.Push("Files", subitem);

        //            var result = await _context.LexonUsers.UpdateOneAsync(filter, update);

        //            var eventAssoc = new AddFileToUserIntegrationEvent(idUser, idFile, nameFile, descriptionFile);
        //            await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);

        //            await session.CommitTransactionAsync(cancel).ConfigureAwait(false);
        //            return result.ModifiedCount;
        //        }
        //        catch (Exception e)
        //        {
        //            Console.WriteLine(e.Message);
        //            session.AbortTransaction(cancel);
        //            return 0;
        //        }
        //    }
        //}

        public async Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        {
            //todo: hacer método para desclasificar mail
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                //todo: ver como hacer update de una subcoleción
                session.StartTransaction();
                try
                {
                    var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
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
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
            return await _context.LexonUsers.Find(filter).SingleAsync();
        }

        public async Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser, long idCompany, string search)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            var company = user.Companies.List.FirstOrDefault(x => x.IdCompany == idCompany);
            //todo: hacer busqueda combinada de la comnpañia y del usuario

            //todo: hacer procedimiento para buscar los datos de expedientes en mongo
            return company.Files.List.ToList();
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
                            u => u.IdUser == idUser, // && u.Companies.List[-1].IdCompany == idCompany,
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
                            u => u.IdUser == idUser, // && u.Companies.List[-1].IdCompany == idCompany,
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

        public async Task<LexonCompany> SelectCompanyAsync(string idUser, long idCompany)
        {
            throw new NotImplementedException();
        }

        public async Task<LexonActuationMailList> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            var company = user.Companies.List.FirstOrDefault(x => x.IdCompany == idCompany);

            //todo: hacer procedimiento para buscar los datos de clasificaciones en mongo
            return new LexonActuationMailList();
        }

        #endregion PublishEvents
    }
}