namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Account.API.Model;
    using IntegrationEvents.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    #endregion Using

    public class AccountsRepository : BaseClass<AccountsRepository>, IAccountsRepository
    {
        private readonly AccountContext _context;
        private readonly IEventBus _eventBus;
        //private readonly ILogger<AccountsRepository> _log;

        public AccountsRepository(
            IOptions<AccountSettings> settings,
            IEventBus eventBus,
            ILogger<AccountsRepository> logger,
            IConfiguration configuration) : base(logger)
        {
            _context = new AccountContext(settings, eventBus, configuration);
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

        //public async Task<Result<UserMail>> Get(string id)
        //{
        //    var result = new Result<UserMail> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var accounts = _context.Accounts.Find(x => x.Id == id);
        //        if (!accounts.Any())
        //            return result;

        //        result.data = await accounts.FirstOrDefaultAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        public async Task<Result<UserMail>> Create(UserMail account)
        {
            var result = new Result<UserMail> { errors = new List<ErrorInfo>() };
            try
            {
                var accountExists = _context.Accounts.Find(x => x.Provider.Equals(account.Provider) && x.Email.Equals(account.Email) && x.User.Equals(account.User));
                if (!accountExists.Any())
                {
                    await _context.Accounts.InsertOneAsync(account);
                    result.data = account;
                }
                else
                {
                    result.data = accountExists.First();
                }

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

        //public async Task<Result<long>> Update(string id, UserMail accountIn)
        //{
        //    var result = new Result<long> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var accountUpdate = await _context.Accounts.Find(x => x.Id == id).FirstOrDefaultAsync();
        //        var resultUpdate = await _context.Accounts.ReplaceOneAsync(account => account.Id == id, accountIn);
        //        result.data = resultUpdate.ModifiedCount;

        //        if (accountUpdate != null)
        //        {
        //            var eventAssoc = new AddOperationAccountIntegrationEvent(accountUpdate.User, accountUpdate.Provider, accountUpdate.Email, accountUpdate.DefaultAccount, EnTypeOperation.Update);
        //            _eventBus.Publish(eventAssoc);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

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

        public async Task<Result<UserMail>> GetUser(string user)
        {
            var result = new Result<UserMail> { errors = new List<ErrorInfo>() };
            try
            {
                result.data = await _context.Accounts.Find(account => account.User == user).SingleAsync();
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<Account>> GetAccount(string user, string mail)
        {
            var result = new Result<Account> { errors = new List<ErrorInfo>() };
            try
            {
                var usuario = await _context.Accounts.Find(account => account.User == user).SortByDescending(x => x.DefaultAccount).SingleAsync();
                var correoPorDefecto = usuario.Accounts.Find(x => x.defaultAccount = true && x.email.ToUpperInvariant().Equals(mail.ToUpperInvariant()));
                result.data = correoPorDefecto;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            var updateOptions = new UpdateOptions { IsUpsert = false };
            TraceLog(parameters: new string[] { $"usuario:{user}", $"email:{email}", $"provider:{provider}", $"guid:{guid}" });
            try
            {
                // 1. Si no existe, crea la cuenta TODO: esto no tiene sentido
                var accounts = _context.Accounts.Find(x => x.User == user);
                if (!accounts.Any())
                {
                    TraceLog(parameters: new string[] { $"se crea un nuevo usuario porque no existe ninguno con user:{user}" });

                    await _context.Accounts.InsertOneAsync(new UserMail
                    {
                        User = user,
                        Provider = provider,
                        Email = email,
                        DefaultAccount = true,
                        guid = guid
                    });
                    result.data = 1;
                }
                else

                {
                    //2. si encuentra cuentas con esos datos, los actualiza cambiando todo a no default y actualiza los datos

                    var resultUpdate = await _context.Accounts.UpdateManyAsync(
                        account => account.User == user,
                        Builders<UserMail>.Update.Set(x => x.DefaultAccount, false)
                        );

                    TraceLog(parameters: new string[] { $"Se modifican {resultUpdate.ModifiedCount} cuentas con default a :{false}" });
                    result.data = resultUpdate.ModifiedCount;

                    resultUpdate = await _context.Accounts.UpdateOneAsync(
                        account => account.User == user && account.Email == email && account.Provider == provider,
                        Builders<UserMail>.Update.Set(x => x.DefaultAccount, true).Set(x => x.Email, email).Set(x => x.guid, guid),
                        updateOptions);
                    if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0)
                    {
                        TraceLog(parameters: new string[] { $"Se modifican {resultUpdate.ModifiedCount} con el default {true} y/o insertan con id {resultUpdate.UpsertedId}" });
                        result.data += resultUpdate.ModifiedCount;
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
                var resultUpdate = await _context.Accounts.UpdateManyAsync(account => account.User == user, Builders<UserMail>.Update.Set(x => x.DefaultAccount, false));
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

        public async Task<Result<long>> UpSertAccount(string user, Account accountIn)
        {
            var result = new Result<long> { errors = new List<ErrorInfo>() };
            var cancel = default(CancellationToken);
            using (var session = await _context.StartSession(cancel))
            {
                session.StartTransaction();
                try
                {
                    var resultado = await _context.AccountsTransaction(session).UpdateOneAsync(
                            GetFilterUser(user),
                            Builders<UserMail>.Update.AddToSet($"Accounts", accountIn)
                        );
                    result.data = resultado.ModifiedCount;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                    session.AbortTransaction();
                }
            }
            return result;
        }

        private static FilterDefinition<UserMail> GetFilterUser(string idUser)
        {
            return Builders<UserMail>.Filter.Eq(u => u.User, idUser);
        }

        #region PublishEvents

        //private async Task CreateAndPublishIntegrationEventLogEntry(IClientSessionHandle session, IntegrationEvent eventAssoc)
        //{
        //    //TODO:revisar el guid para quitarlo
        //    var eventLogEntry = new IntegrationEventLogEntry(eventAssoc, Guid.NewGuid());
        //    await _context.IntegrationEventLogsTransaction(session).InsertOneAsync(eventLogEntry);
        //    await _context.PublishThroughEventBusAsync(eventAssoc, session);
        //}

        //public async Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation)
        //{
        //    throw new NotImplementedException();
        //}

        #endregion PublishEvents
    }
}