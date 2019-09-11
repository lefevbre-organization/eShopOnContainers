using Lexon.API.IntegrationsEvents.Events;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using Microsoft.Extensions.Options;
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

        public async Task<List<LexonClassification>> GetClassificationListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            return user.Classifications.Take(pageSize).ToList();
        }

        public async Task<List<LexonCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            return user.Companies.Take(pageSize).ToList();
        }

        public async Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);

            var user = await _context.LexonUsers
                .Find(filter)
                .SingleAsync();

            return user.Files.Take(pageSize).ToList();
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

        public async Task<long> AddFileToListAsync(string idUser, long idFile, string nameFile, string descriptionFile = "")
        {
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
                    var user = await _context.LexonUsers
                        .Find(filter)
                        .SingleAsync();

                    var builder = Builders<LexonUser>.Update;
                    var subitem = new LexonFile
                    {
                        IdFile = (int)idFile,
                        Name = nameFile,
                        Description = descriptionFile
                    };
                    var update = builder.Push("Files", subitem);

                    var result = await _context.LexonUsers.UpdateOneAsync(filter, update);

                    var eventAssoc = new AddFileToUserIntegrationEvent(idUser, idFile, nameFile, descriptionFile);
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

        public async Task<long> AddFileToListInDocumentAsync(string idUser, long idFile, string nameFile, string descriptionFile = "")
        {
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
                    var user = await _context.LexonUsers
                        .Find(filter)
                        .SingleAsync();

                    var builder = Builders<LexonUser>.Update;
                    var subitem = new LexonFile
                    {
                        IdFile = (int)idFile,
                        Name = nameFile,
                        Description = descriptionFile
                    };
                    var update = builder.Push("Files", subitem);

                    var result = await _context.LexonUsers.UpdateOneAsync(filter, update);

                    var eventAssoc = new AddFileToUserIntegrationEvent(idUser, idFile, nameFile, descriptionFile);
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

        public async Task<long> AddClassificationToListAsync(string idUser, string idMail, long idRelated, string type = "File")
        {
            var cancel = default(CancellationToken);
            var raiseAssociateMailToFileEvent = type == "File";
            var raiseAssociateMailToClientEvent = type == "Client";
            var raiseAssociateMailToDocumentEvent = type == "Document";

            using (var session = await _context.StartSession(cancel))
            {
                //var transactionOptions = new TransactionOptions(ReadConcern.Snapshot, ReadPreference.Primary, WriteConcern.WMajority);
                //session.StartTransaction(transactionOptions);
                session.StartTransaction();
                try
                {
                    var filter = Builders<LexonUser>.Filter.Eq(u => u.IdUser, idUser);
                    var user = await _context.LexonUsersTransaction(session)
                        .Find(filter)
                        .SingleAsync();

                    var builder = Builders<LexonUser>.Update;
                    var cla = new LexonClassification
                    {
                        IdClassification = 1,
                        IdMail = idMail,
                        IdRelated = idRelated,
                        Type = type
                    };
                    var update = builder.Push("Classifications", cla);

                    var result = await _context.LexonUsersTransaction(session).UpdateOneAsync(filter, update);
                    if (raiseAssociateMailToFileEvent)
                    {
                        var eventAssoc = new AssociateMailToFileIntegrationEvent(idUser, idRelated, idMail);
                        await CreateAndPublishIntegrationEventLogEntry(session, eventAssoc);
                    }else if(raiseAssociateMailToClientEvent)
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
                    return result.ModifiedCount;
                }
                catch (Exception e)

                {
                    Console.WriteLine(e.Message);
                    session.AbortTransaction();
                    return 0;
                }
            }
        }

        #endregion PublishEvents
    }
}