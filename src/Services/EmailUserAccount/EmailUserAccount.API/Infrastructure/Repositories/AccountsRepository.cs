
namespace EmailUserAccount.API.Infrastructure.Repositories
{
    #region Using

    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
    using Microsoft.Extensions.Options;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using EmailUserAccount.API.Model;
    using IntegrationEvents.Events;

    #endregion

    public class AccountsRepository : IAccountsRepository
    {
        private readonly EmailUserAccountContext _context;

        public AccountsRepository(
            IOptions<EmailUserAccountSettings> settings,
            IEventBus eventBus)
        {
            _context = new EmailUserAccountContext(settings, eventBus);
        }

        public Task<Account> GetAsync(int idUser)
        {
            throw new NotImplementedException();
        }

        public Task<List<Account>> GetListAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<Account>> GetListAsync(int pageSize, int pageIndex)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Account>> GetListByUserAsync(int pageSize, int pageIndex, string idUser)
        {
            var filter = Builders<Account>.Filter.Eq(x => x.User, idUser);
            return await _context.Accounts
                .Find(filter)
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

        public async Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation)
        {
            throw new NotImplementedException();
        }

        #endregion PublishEvents
    }
}