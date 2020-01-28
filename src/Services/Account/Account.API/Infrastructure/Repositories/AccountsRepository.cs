namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Account.API.Model;
    using IntegrationEvents.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson;
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

        public AccountsRepository(
            IOptions<AccountSettings> settings,
            IEventBus eventBus,
            ILogger<AccountsRepository> logger,
            IConfiguration configuration) : base(logger)
        {
            _context = new AccountContext(settings, eventBus, configuration);
            _eventBus = eventBus;
        }

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

        public async Task<Result<UserMail>> RemoveAccount(string user, string mail)
        {
            var result = new Result<UserMail> { errors = new List<ErrorInfo>() };
            var options = new FindOneAndUpdateOptions<UserMail> { ReturnDocument = ReturnDocument.After };
            try
            {
                var update = Builders<UserMail>.Update.PullFilter(p => p.Accounts,
                                                f => f.email.Equals(mail));
                var userUpdate = await _context.Accounts.FindOneAndUpdateAsync<UserMail>(
                    GetFilterUser(user),
                    update, options);

                if (userUpdate != null)
                {
                    var eventAssoc = new AddOperationAccountIntegrationEvent(userUpdate.User, userUpdate.Provider, userUpdate.Email, userUpdate.DefaultAccount, EnTypeOperation.Remove);
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
                    await _context.Accounts.Find(GetFilterUser(user)).SortByDescending(x => x.DefaultAccount).ToListAsync();

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
                result.data = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
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
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).SingleAsync();
                var cuenta = usuario.Accounts.Find(x => x.email.ToUpperInvariant().Equals(mail.ToUpperInvariant()));
                result.data = cuenta;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<Account>> GetDefaultAccount(string user)
        {
            var result = new Result<Account> { errors = new List<ErrorInfo>() };
            try
            {
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                var cuenta = usuario?.Accounts.Find(x => x.defaultAccount = true);
                result.data = cuenta;
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
            var updateOptions = new UpdateOptions { IsUpsert = true };
            TraceLog(parameters: new string[] { $"usuario:{user}", $"email:{email}", $"provider:{provider}", $"guid:{guid}" });
            try
            {
                // 1. Si no existe, crea la cuenta
                UserMail userMail = GetNewUserMail(user, email, provider, guid);
                var accounts = _context.Accounts.Find(x => x.User == user);

                if (!accounts.Any())
                {
                    TraceLog(parameters: new string[] { $"se crea un nuevo usuario porque no existe ninguno con user:{user}" });
                    await _context.Accounts.InsertOneAsync(userMail);
                    result.data = 1;
                }
                else

                {
                    //2. si encuentra cuentas con esos datos, los actualiza cambiando todo a no default y actualiza los datos

                    var cancel = default(CancellationToken);
                    using (var session = await _context.StartSession(cancel))
                    {
                        session.StartTransaction();
                        try
                        {
                            var resultadoReset = await ResetDefaultAccountByUser(user);
                            result.data = resultadoReset.data;

                            var resultReplace = await _context.AccountsTransaction(session).ReplaceOneAsync(
                                account => account.User == user && account.Email == email && account.Provider == provider,
                                userMail, updateOptions);

                            if (resultReplace.IsAcknowledged && resultReplace.MatchedCount > 0)
                            {
                                TraceLog(parameters: new string[] { $"Se modifican {resultReplace.ModifiedCount} con el default {true} y/o insertan con id {resultReplace.UpsertedId}" });
                                result.data += (resultReplace.ModifiedCount + (resultReplace.UpsertedId != null ? 1 : 0));
                            }

                            var resultadoListado = await _context.AccountsTransaction(session).UpdateOneAsync(
                                    GetFilterUser(user),
                                    Builders<UserMail>.Update.AddToSet($"Accounts", userMail.Accounts[0])
                                );

                            if (resultadoListado.IsAcknowledged && resultadoListado.MatchedCount > 0)
                            {
                                TraceLog(parameters: new string[] { $"Se añade {resultadoListado.ModifiedCount} una cuentas con el default {true}" });
                                result.data += resultReplace.ModifiedCount;
                            }
                        }
                        catch (Exception ex)
                        {
                            TraceMessage(result.errors, ex);
                            session.AbortTransaction();
                        }
                    }
                    return result;
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

        private static UserMail GetNewUserMail(string user, string email, string provider, string guid)
        {
            return new UserMail()
            {
                User = user,
                Email = email,
                guid = guid,
                Provider = provider,
                DefaultAccount = true,
                Accounts = new List<Account>() {
                            new Account() {defaultAccount = true, email= email, guid= guid, provider= provider }
                        }
            };
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
                var resultUpdate = await _context.Accounts.UpdateManyAsync(
                    account => account.User == user,
                    Builders<UserMail>.Update
                        .Set(x => x.DefaultAccount, false)
                        .Set("Accounts.$[i].defaultAccount", false),
                    new UpdateOptions
                    {
                        ArrayFilters = new List<ArrayFilterDefinition>
                        {
                          new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.defaultAccount", true))
                        }
                    }
                    );

                var modificados = resultUpdate.IsAcknowledged ? resultUpdate.ModifiedCount : 0;
                TraceLog(parameters: new string[] { $"Se modifican {modificados} usuarios con default a :{false}" });

                result.data = resultUpdate.ModifiedCount;
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
            try
            {
                var resultUpdate = await _context.Accounts.UpdateManyAsync(
                    account => account.User == user,
                    Builders<UserMail>.Update
                        .Set(x => x.DefaultAccount, false)
                        .Set("Accounts.$[i].defaultAccount", false)
                        .AddToSet($"Accounts", accountIn),
                    new UpdateOptions
                    {
                        ArrayFilters = new List<ArrayFilterDefinition>
                        {
                          new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.defaultAccount", true))
                        }
                    }
                    );

                var modificados = resultUpdate.IsAcknowledged ? resultUpdate.ModifiedCount : 0;
                TraceLog(parameters: new string[] { $"Se modifican {modificados} usuarios con default a :{false}" });

                result.data = resultUpdate.ModifiedCount;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;

            //var cancel = default(CancellationToken);
            //using (var session = await _context.StartSession(cancel))
            //{
            //    session.StartTransaction();
            //    try
            //    {
            //        var resultado = await _context.AccountsTransaction(session).UpdateOneAsync(
            //                GetFilterUser(user),
            //                Builders<UserMail>.Update.AddToSet($"Accounts", accountIn)
            //            );
            //        result.data = resultado.ModifiedCount;
            //    }
            //    catch (Exception ex)
            //    {
            //        TraceMessage(result.errors, ex);
            //        session.AbortTransaction();
            //    }
            //}
            //return result;
        }

        private static FilterDefinition<UserMail> GetFilterUser(string idUser, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<UserMail>.Filter.And(
                Builders<UserMail>.Filter.Eq(u => u.User, idUser),
                Builders<UserMail>.Filter.Eq(u => u.state, true));
            }

            return Builders<UserMail>.Filter.Eq(u => u.User, idUser);
        }

        public async Task<Result<bool>> ChangueState(string user, bool state)
        {
            var result = new Result<bool> { errors = new List<ErrorInfo>() };
            try
            {
                var resultUpdate = await _context.Accounts.UpdateOneAsync(
                    GetFilterUser(user, false),
                    Builders<UserMail>.Update.Set(x => x.state, state)
                 );

                var modificados = resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0;
                TraceLog(parameters: new string[] { $"Se pone el usuario {user} en estado :{state}" });

                result.data = modificados;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }
    }
}