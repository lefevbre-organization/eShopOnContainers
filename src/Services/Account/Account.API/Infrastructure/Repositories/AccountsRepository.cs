﻿namespace Account.API.Infrastructure.Repositories
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
    using Account.API.Model;
    using IntegrationEvents.Events;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;
    using Microsoft.Extensions.Configuration;

    #endregion

    public class AccountsRepository : BaseClass<AccountsRepository>, IAccountsRepository
    {
        private readonly AccountContext _context;
        private readonly IEventBus _eventBus;
        private readonly ILogger<AccountsRepository> _log;

        public AccountsRepository(
            IOptions<AccountSettings> settings,
            IEventBus eventBus,
            ILogger<AccountsRepository> logger,
            IConfiguration configuration) : base(logger)
        {
            _context = new AccountContext(settings, eventBus, configuration );
            _eventBus = eventBus;
        }

        public async Task<Result<AccountList>> Get()
        {
            var result = new Result<AccountList> { errors = new List<ErrorInfo>() };
            try 
            {
                var accounts = await _context.Accounts.Find(account => true).ToListAsync();
                result.data = new AccountList { Accounts = accounts.ToArray() };
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<Account>> Get(string id)
        {
            var result = new Result<Account> { errors = new List<ErrorInfo>() };
            try 
            {
                var accounts = _context.Accounts.Find(x => x.Id == id);
                if (!accounts.Any())
                    return result;

                result.data = await accounts.FirstOrDefaultAsync();                
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<Account>> Create(Account account)
        {
            var result = new Result<Account> { errors = new List<ErrorInfo>() };
            try
            {
                await _context.Accounts.InsertOneAsync(account);
                result.data = account;

                var eventAssoc = new AddOperationAccountIntegrationEvent(account.User, account.Provider, account.Email, account.DefaultAccount, EnTypeOperation.Create);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> Remove(string id)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            try 
            {
                var accountRemove = await _context.Accounts.Find(x => x.Id == id).FirstOrDefaultAsync();
                var resultRemove = await _context.Accounts.DeleteOneAsync(account => account.Id == id);
                result.data = resultRemove.DeletedCount;

                if (accountRemove != null) 
                { 
                    var eventAssoc = new AddOperationAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> Update(string id, Account accountIn)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            try
            {
                var accountUpdate = await _context.Accounts.Find(x => x.Id == id).FirstOrDefaultAsync();
                var resultUpdate = await _context.Accounts.ReplaceOneAsync(account => account.Id == id, accountIn);
                result.data = resultUpdate.ModifiedCount;

                if (accountUpdate != null)
                {
                    var eventAssoc = new AddOperationAccountIntegrationEvent(accountUpdate.User, accountUpdate.Provider, accountUpdate.Email, accountUpdate.DefaultAccount, EnTypeOperation.Update);
                    _eventBus.Publish(eventAssoc);
                }               
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<AccountList>> GetByUser(string user)
        {
            var result = new Result<AccountList> { errors = new List<ErrorInfo>() };
            try
            {
                var accounts = string.IsNullOrEmpty(user) ?
                    await _context.Accounts.Find(account => true).SortByDescending(x => x.DefaultAccount).ToListAsync() :
                    await _context.Accounts.Find(account => account.User == user).SortByDescending(x => x.DefaultAccount).ToListAsync();

                result.data = new AccountList { Accounts = accounts.ToArray() };
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider = null)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            try
            {
                // I need to know if user exists in Lexon!!!!!!!
                var accounts = await _context.Accounts.Find(x => x.User == user).ToListAsync();
                if (accounts?.Count == 0)
                {
                    await _context.Accounts.InsertOneAsync(new Account
                    {
                        User = user,
                        Provider = provider,
                        Email = email,
                        DefaultAccount = true
                    });
                    result.data = 1;
                }
                else
                {
                    accounts = await _context.Accounts.Find(x => x.User == user && x.Email == email).ToListAsync();
                    if (accounts?.Count > 0)
                    {
                        var resultUpdate = await _context.Accounts.UpdateManyAsync(account => account.User == user && account.Email != email, Builders<Account>.Update.Set(x => x.DefaultAccount, false));
                        result.data = resultUpdate.ModifiedCount;
                        resultUpdate = await _context.Accounts.UpdateManyAsync(account => account.User == user && account.Email == email, Builders<Account>.Update.Set(x => x.DefaultAccount, true).Set(x => x.Email, email));
                        result.data += resultUpdate.ModifiedCount;
                    }
                    else
                    {
                        var resultUpdate = await _context.Accounts.UpdateManyAsync(account => account.User == user && account.Email != email, Builders<Account>.Update.Set(x => x.DefaultAccount, false));
                        result.data = resultUpdate.ModifiedCount;
                        await _context.Accounts.InsertOneAsync(new Account
                        {
                            User = user,
                            Provider = provider,
                            Email = email,
                            DefaultAccount = true
                        });
                        result.data ++;
                    }
                }
 
                var eventAssoc = new AddOperationAccountIntegrationEvent(user, provider, email, true, EnTypeOperation.UpdateDefaultAccount);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            try
            {
                var accountRemove = await _context.Accounts.Find(x => x.User == user && x.Email == email).FirstOrDefaultAsync();    
                if (accountRemove != null)
                {
                    var resultRemove = await _context.Accounts.DeleteOneAsync(account => account.Id == accountRemove.Id);
                    result.data = resultRemove.DeletedCount;
                    var eventAssoc = new AddOperationAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> ResetDefaultAccountByUser(string user)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            try
            {
                var resultUpdate = await _context.Accounts.UpdateManyAsync(account => account.User == user, Builders<Account>.Update.Set(x => x.DefaultAccount, false));
                result.data = resultUpdate.ModifiedCount;

                var accountFind = await _context.Accounts.Find(x => x.User == user).FirstOrDefaultAsync();
                if (accountFind != null)
                {
                    var eventAssoc = new AddOperationAccountIntegrationEvent(user, string.Empty, string.Empty, false, EnTypeOperation.Update);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
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