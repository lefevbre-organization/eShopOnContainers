﻿namespace EmailUserAccount.API.Infrastructure.Repositories
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

        public async Task<List<Account>> Get()
        {
            return await _context.Accounts.Find(account => true).ToListAsync();
        }

        public async Task<Account> Get(string id)
        {
            var accounts = _context.Accounts.Find(x => x.Id == id);
            if (!accounts.Any())
                return null;

            return await accounts.FirstOrDefaultAsync();
        }

        public async Task Create(Account account)
        {
            await _context.Accounts.InsertOneAsync(account);

            var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(account.User, account.Provider, account.Email, account.DefaultAccount, EnTypeOperation.Create);
            //await CreateAndPublishIntegrationEventLogEntry(_context.Session, eventAssoc);
        }

        public async Task Remove(string id)
        {
            var accountRemove = await _context.Accounts.Find(x => x.Id == id).FirstOrDefaultAsync();

            await _context.Accounts.DeleteOneAsync(account => account.Id == id);
            
            var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
            //await CreateAndPublishIntegrationEventLogEntry(null, eventAssoc);
        }

        public async Task Update(string id, Account accountIn)
        {
            var accountUpdate = await _context.Accounts.Find(x => x.Id == id).FirstOrDefaultAsync();

            await _context.Accounts.ReplaceOneAsync(account => account.Id == id, accountIn);

            var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(accountUpdate.User, accountUpdate.Provider, accountUpdate.Email, accountUpdate.DefaultAccount, EnTypeOperation.Update);
            //await CreateAndPublishIntegrationEventLogEntry(null, eventAssoc);
        }

        public async Task<List<Account>> GetByUser(string user)
        {
            if (string.IsNullOrEmpty(user))
                return await _context.Accounts.Find(account => true).ToListAsync();

            return await _context.Accounts.Find(account => account.User == user).ToListAsync();
        }

        public async Task UpdateDefaultAccount(string user, string provider, string email)
        {
            var accounts = await _context.Accounts.Find(x => x.User == user && x.Provider == provider).ToListAsync();
            if (accounts?.Count == 0)
            {
                await _context.Accounts.InsertOneAsync(new Account
                {
                    User = user,
                    Provider = provider,
                    Email = email,
                    DefaultAccount = true
                });
            }
            else
            {
                await _context.Accounts.UpdateManyAsync(account => account.User == user && account.Provider != provider, Builders<Account>.Update.Set(x => x.DefaultAccount, false));
                await _context.Accounts.UpdateManyAsync(account => account.User == user && account.Provider == provider, Builders<Account>.Update.Set(x => x.DefaultAccount, true).Set(x => x.Email, email));
            }

            var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(user, provider, email, true, EnTypeOperation.UpdateDefaultAccount);
            //await CreateAndPublishIntegrationEventLogEntry(null, eventAssoc);
        }

        public async Task<bool> DeleteAccountByUserAndProvider(string user, string provider)
        {
            var account = await _context.Accounts.Find(x => x.User == user && x.Provider == provider).FirstOrDefaultAsync();
            if (account != null)
            {
                await _context.Accounts.DeleteOneAsync(accountDelete => accountDelete.Id == account.Id);

                var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(account.User, account.Provider, account.Email, account.DefaultAccount, EnTypeOperation.Remove);
                //await CreateAndPublishIntegrationEventLogEntry(null, eventAssoc);

                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> ResetDefaultAccountByUser(string user)
        {
            var accountFind = await _context.Accounts.Find(x => x.User == user).FirstOrDefaultAsync();
            if (accountFind != null)
            {
                await _context.Accounts.UpdateManyAsync(account => account.User == user, Builders<Account>.Update.Set(x => x.DefaultAccount, false));

                var eventAssoc = new AddOperationEmailUserAccountIntegrationEvent(user, string.Empty, string.Empty, false, EnTypeOperation.Update);
                //await CreateAndPublishIntegrationEventLogEntry(null, eventAssoc);

                return true;
            }
            else
            {
                return false;
            }
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