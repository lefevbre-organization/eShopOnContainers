namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Account.API.Model;
    using IntegrationEvents.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
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

        #region old

        //public async Task<Result<UserMail>> CreateV1(UserMail account)
        //{
        //    var result = new Result<UserMail> { errors = new List<ErrorInfo>() };
        //    var finalUser = GetNewUserMail(account.User, account.Email, account.Provider, account.guid);
        //    try
        //    {
        //        var resultadoReset = await ResetDefaultAccountByUser(finalUser.User);

        //        var accountExists = _context.Accounts.Find(x => x.Provider.Equals(finalUser.Provider) && x.Email.Equals(finalUser.Email) && x.User.Equals(finalUser.User));
        //        if (!accountExists.Any())
        //        {
        //            await _context.Accounts.InsertOneAsync(finalUser);
        //            result.data = finalUser;
        //        }
        //        else
        //        {
        //            result.data = accountExists.First();
        //        }

        //        var eventAssoc = new AddOperationAccountIntegrationEvent(finalUser.User, finalUser.Provider, finalUser.Email, finalUser.DefaultAccount, EnTypeOperation.Create);
        //        _eventBus.Publish(eventAssoc);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<long>> UpdateDefaultAccountV1(string user, string email, string provider, string guid)
        //{
        //    var result = new Result<long> { errors = new List<ErrorInfo>() };
        //    var arrayFilters = GetFilterFromAccount(provider, email);
        //    try
        //    {
        //        // I need to know if user exists in Lexon!!!!!!!
        //        UserMail userMail = GetNewUserMail(user, email, provider, guid);

        //        var accounts = await _context.Accounts.Find(x => x.User == user).ToListAsync();
        //        if (accounts?.Count == 0)
        //        {
        //            await _context.Accounts.InsertOneAsync(userMail);
        //            result.data = 1;
        //        }
        //        else
        //        {
        //            accounts = await _context.Accounts.Find(x => x.User == user && x.Email == email).ToListAsync();
        //            if (accounts?.Count > 0)
        //            {
        //                var resultUpdate = await _context.Accounts.UpdateManyAsync(
        //                    account => account.User == user && account.Email != email,
        //                    Builders<UserMail>.Update
        //                        .Set(x => x.DefaultAccount, false)
        //                        //.Set("accounts.$[i].defaultAccount", false),
        //                        //new UpdateOptions { ArrayFilters = arrayFilters }
        //                        );
        //                result.data = resultUpdate.ModifiedCount;
        //                resultUpdate = await _context.Accounts.UpdateManyAsync(
        //                    account => account.User == user && account.Email == email,
        //                    Builders<UserMail>.Update
        //                    .Set(x => x.DefaultAccount, true)
        //                    .Set(x => x.Email, email));
        //                result.data += resultUpdate.ModifiedCount;
        //            }
        //            else
        //            {
        //                var resultUpdate = await _context.Accounts.UpdateManyAsync(
        //                    account => account.User == user && account.Email != email,
        //                    Builders<UserMail>.Update
        //                        .Set(x => x.DefaultAccount, false)
        //                    //.Set("accounts.$[i].defaultAccount", false),
        //                    //new UpdateOptions { ArrayFilters = arrayFilters }
        //                    );
        //                result.data = resultUpdate.ModifiedCount;
        //                await _context.Accounts.InsertOneAsync(userMail);
        //                result.data++;
        //            }
        //        }

        //        var eventAssoc = new AddOperationAccountIntegrationEvent(user, provider, email, true, EnTypeOperation.UpdateDefaultAccount);
        //        _eventBus.Publish(eventAssoc);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<AccountList>> GetByUser(string user)
        //{
        //    var result = new Result<AccountList> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var accounts = await _context.Accounts.Find(GetFilterUser(user)).SortByDescending(x => x.Id).ToListAsync();

        //        result.data = new AccountList { Accounts = accounts.ToArray() };
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<AccountList>> GetByUserV1(string user)
        //{
        //    var result = new Result<AccountList> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var accounts = string.IsNullOrEmpty(user) ?
        //            await _context.Accounts.Find(account => true).SortByDescending(x => x.DefaultAccount).ToListAsync() :
        //            await _context.Accounts.Find(GetFilterUser(user)).SortByDescending(x => x.DefaultAccount).ToListAsync();

        //        result.data = new AccountList { Accounts = accounts.ToArray() };
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<UpdateResult>> AddUser(string user)
        //{
        //    var result = new Result<UpdateResult> { errors = new List<ErrorInfo>() };
        //    var filter = GetFilterUser(user, false);
        //    var update = Builders<UserMail>.Update
        //        .Set($"user", user)
        //        .Set($"state", true);
        //    var options = GetUpsertOptions();
        //    try
        //    {
        //        result.data = await _context.Accounts.UpdateOneAsync(filter, update, options);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email)
        //{
        //    var result = new Result<long> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var accountRemove = await _context.Accounts.Find(x => x.User == user && x.Email == email).FirstOrDefaultAsync();
        //        if (accountRemove != null)
        //        {
        //            var resultRemove = await _context.Accounts.DeleteOneAsync(account => account.Id == accountRemove.Id);
        //            result.data = resultRemove.DeletedCount;
        //            var eventAssoc = new AddOperationAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
        //            _eventBus.Publish(eventAssoc);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<long>> DeleteAccountByUser(string user)
        //{
        //    var result = new Result<long> { errors = new List<ErrorInfo>() };
        //    try
        //    {
        //        var resultRemove = await _context.Accounts.DeleteManyAsync(GetFilterUser(user));
        //        result.data = resultRemove.DeletedCount;
        //        //var eventAssoc = new AddOperationAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
        //        //_eventBus.Publish(eventAssoc);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        //public async Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid)
        //{
        //    //TODO: Cambiar por método insertar usurio si no esiste en el upsert
        //    var result = new Result<long> { errors = new List<ErrorInfo>() };
        //    var updateOptions = new UpdateOptions { IsUpsert = true };
        //    TraceLog(parameters: new string[] { $"usuario:{user}", $"email:{email}", $"provider:{provider}", $"guid:{guid}" });
        //    try
        //    {
        //        // 1. Si no existe, crea la cuenta
        //        UserMail userMail = GetNewUserMail(user, email, provider, guid);
        //        var accounts = _context.Accounts.Find(GetFilterUser(user));

        //        if (!accounts.Any())
        //        {
        //            TraceLog(parameters: new string[] { $"se crea un nuevo usuario porque no existe ninguno con user:{user}" });
        //            result.data = 1;
        //            await _context.Accounts.InsertOneAsync(userMail);
        //        }
        //        else

        //        {
        //            //2. si encuentra cuentas con esos datos, los actualiza cambiando todo a no default y actualiza los datos

        //            var cancel = default(CancellationToken);
        //            using (var session = await _context.StartSession(cancel))
        //            {
        //                session.StartTransaction();
        //                try
        //                {
        //                    var resultadoReset = await ResetDefaultAccountByUser(user);
        //                    result.data = resultadoReset.data;

        //                    var resultReplace = await _context.AccountsTransaction(session).ReplaceOneAsync(
        //                        account => account.User == user && account.Email == email && account.Provider == provider,
        //                        userMail, updateOptions);

        //                    if (resultReplace.IsAcknowledged && resultReplace.MatchedCount > 0)
        //                    {
        //                        TraceLog(parameters: new string[] { $"Se modifican {resultReplace.ModifiedCount} con el default {true} y/o insertan con id {resultReplace.UpsertedId}" });
        //                        result.data += (resultReplace.ModifiedCount + (resultReplace.UpsertedId != null ? 1 : 0));
        //                    }

        //                    var resultadoListado = await _context.AccountsTransaction(session).UpdateOneAsync(
        //                            GetFilterUser(user),
        //                            Builders<UserMail>.Update.AddToSet($"accounts", userMail.accounts[0])
        //                        );

        //                    if (resultadoListado.IsAcknowledged && resultadoListado.MatchedCount > 0)
        //                    {
        //                        TraceLog(parameters: new string[] { $"Se añade {resultadoListado.ModifiedCount} una cuentas con el default {true}" });
        //                        result.data += resultReplace.ModifiedCount;
        //                    }
        //                }
        //                catch (Exception ex)
        //                {
        //                    TraceMessage(result.errors, ex);
        //                    session.AbortTransaction();
        //                }
        //            }
        //            return result;
        //        }

        //        var eventAssoc = new AddOperationAccountIntegrationEvent(user, provider, email, true, EnTypeOperation.UpdateDefaultAccount);
        //        _eventBus.Publish(eventAssoc);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        #endregion old

        /// <summary>
        /// Crea o actualiza un usuario, mandando un mensaje al bus
        /// </summary>
        /// <param name="userMail"></param>
        /// <returns></returns>
        public async Task<Result<UserMail>> Create(UserMail userMail)
        {
            var result = new Result<UserMail>();

            ReviewUserMail(userMail);

            try
            {
                var resultReplace = await _context.Accounts.ReplaceOneAsync(GetFilterUser(userMail.User, false), userMail, GetUpsertOptions());

                if (!resultReplace.IsAcknowledged)
                    TraceMessage(result.errors, new Exception($"Don´t insert or modify the user"), "1003");
                else if (resultReplace.IsAcknowledged && resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                    TraceInfo(result.infos, $"Se modifica el usuario {userMail.User}");
                else if (resultReplace.IsAcknowledged && resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, $"Se inserta el usuario {userMail.User} con {resultReplace.UpsertedId}");
                    userMail.Id = resultReplace.UpsertedId.ToString();
                }

                result.data = userMail;

                var eventAssoc = new AddUserMailIntegrationEvent(userMail.User, userMail.configUser);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }
        public async Task<Result<UserMail>> GetUser(string user)
        {
            var result = new Result<UserMail>();
            try
            {
                result.data = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                var orderAccounts = result.data.accounts.OrderByDescending(x => x.defaultAccount).ToList();
                result.data.accounts = orderAccounts;

                if (result.data == null)
                    TraceInfo(result.infos, $"No se encuentra ningún usuario {user}");

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<Account>> GetAccount(string user, string provider, string mail)
        {
            var result = new Result<Account>();
            try
            {
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).SingleAsync();

                if (usuario == null)
                    TraceInfo(result.infos, $"No se encuentra ningún usuario {user} del que obtener cuenta");

                var cuenta = usuario.accounts?.Find(GetFilterProviderMail(provider, mail));
                result.data = cuenta;

                if (result.data == null)
                    TraceInfo(result.infos, $"No se encuentra ningúna cuenta {provider} - {mail} en ese usuario {user}");
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }
        public async Task<Result<Account>> GetDefaultAccount(string user)
        {
            var result = new Result<Account>();
            try
            {
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (usuario == null) 
                    TraceInfo(result.infos, $"No se encuentra ningún usuario {user} del que obtener cuenta x defecto");
              
                var cuenta = usuario?.accounts.Find(x => x.defaultAccount == true);
                result.data = cuenta;
                if (result.data == null)            
                    TraceInfo(result.infos, $"No se encuentra ningúna cuenta por defecto en ese usuario {user}");

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail)
        {
            var result = new Result<UserMail>();
            var options = new FindOneAndUpdateOptions<UserMail> { ReturnDocument = ReturnDocument.After };
            try
            {
                var update = Builders<UserMail>.Update.PullFilter(
                    p => p.accounts,
                    f => f.email.Equals(mail.ToLowerInvariant()) && f.provider.Equals(provider.ToUpperInvariant()));
                var userUpdate = await _context.Accounts.FindOneAndUpdateAsync<UserMail>(
                    GetFilterUser(user),
                    update, options);

                if (userUpdate != null)
                {
                    result.data = userUpdate;
                    //var eventAssoc = new AddOperationAccountIntegrationEvent(userUpdate.User, userUpdate.Provider, userUpdate.Email, userUpdate.DefaultAccount, EnTypeOperation.Remove);
                    //_eventBus.Publish(eventAssoc);
                }
                else
                {
                    TraceInfo(result.infos, $"No se encuentra ningún usuario {user} del que quitar la cuenta {provider} - {mail}");
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
            var result = new Result<long>();
            try
            {
                var resultUpdate = await _context.Accounts.UpdateManyAsync(
                    account => account.User == user,
                    Builders<UserMail>.Update
                        .Set("accounts.$[i].defaultAccount", false),
                        FindAccountsDefaultsInCollection()
                    );

                var modificados = resultUpdate.IsAcknowledged ? resultUpdate.ModifiedCount : 0;
                TraceLog(parameters: new string[] { $"Se modifican {modificados} usuarios con default a :{false}" });

                result.data = modificados;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }


        public async Task<Result<long>> UpSertAccount(string user, Account accountIn)
        {
            var result = new Result<long>();
            ReviewAccountMail(accountIn);

            try
            {
                var userMail = GetNewUserMail(user, accountIn.email, accountIn.provider, accountIn.guid);

                var userDb = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userMail;
                    TraceInfo(result.infos, $"Se inserta el usuario {userMail.User}");
                }
                else
                {
                    userDb.accounts.ForEach(x => x.defaultAccount = false);    
                    var accountDb = userDb.accounts.Find(
                        a => a.email == accountIn.email.ToLowerInvariant()
                        && a.provider == accountIn.provider.ToUpperInvariant());

                    if (accountDb == null)
                    {
                        userDb.accounts.Add(accountIn);
                        TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo una cuenta para {accountIn.provider}-{accountIn.email}");

                    }
                    else
                    {
                        accountDb.guid = accountIn.guid;
                        accountDb.sign = accountIn.sign;
                        accountDb.defaultAccount = accountIn.defaultAccount;
                        if (accountIn.configAccount != null)
                            accountDb.configAccount = accountIn.configAccount;

                        TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la cuenta para {accountIn.provider}-{accountIn.email}");
                    }
                }
                var resultReplace = await _context.Accounts.ReplaceOneAsync(GetFilterUser(userMail.User), userDb, GetUpsertOptions());

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

             result.data = 1;
            return result;
        }

        public async Task<Result<bool>> ChangueState(string user, bool state)
        {
            var result = new Result<bool>();
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

        public async Task<Result<bool>> UpSertConfig(string user, ConfigUserLexon config)
        {
            var result = new Result<bool>();

            try
            {
                var resultUpdate = await _context.Accounts.UpdateOneAsync(
                    GetFilterUser(user),
                    Builders<UserMail>.Update.Set($"configUser", config)
                );

                if (!resultUpdate.IsAcknowledged)
                {
                    TraceMessage(result.errors, new Exception($"Don´t insert or modify the userconfig"), "1003");
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la configuracion a adjunction: {config.defaultAdjunction} - entity: {config.defaultEntity} - getContacts: {config.getContacts}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }

                //var insertado = resultUpdate.IsAcknowledged ? resultUpdate.ModifiedCount : 0;
                //TraceLog(parameters: new string[] { $"Se cambia o inserta configuracion  con  getContacts: {config.getContacts} defaultAdjunction: {config.defaultAdjunction} defaultEntity a {config.defaultEntity}" });
                //result.data = resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<bool>> UpSertRelationMail(string user, string provider, string mail, MailRelation relation)
        {
            var result = new Result<bool>();
            var arrayFilters = GetFilterFromAccount(provider, mail);

            try
            {
                var resultUpdate = await _context.Accounts.UpdateOneAsync(
                    GetFilterUser(user),
                    Builders<UserMail>.Update.AddToSet($"accounts.$[i].mails", relation),
                    new UpdateOptions { ArrayFilters = arrayFilters }
                );

                if (!resultUpdate.IsAcknowledged)
                {
                    TraceMessage(result.errors, new Exception($"Don´t insert or modify the relation"), "1003");
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo la relacion en el provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }

                TraceLog(parameters: new string[] { $"Se añade relacion en provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}" });
                result.data = resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<bool>> RemoveRelationMail(string user, string provider, string mail, MailRelation relation)
        {
            var result = new Result<bool>();
            var arrayFilters = GetFilterFromAccount(provider, mail);

            try
            {
                var resultUpdate = await _context.Accounts.UpdateOneAsync(
                    GetFilterUser(user),
                    Builders<UserMail>.Update.Pull($"accounts.$[i].mails", relation),
                    new UpdateOptions { ArrayFilters = arrayFilters }
                );

                if (!resultUpdate.IsAcknowledged)
                {
                    TraceMessage(result.errors, new Exception($"Don´t insert or modify the relation"), "1003");
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {user} quitando la relacion en el provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }

                //TraceLog(parameters: new string[] { $"Se añade relacion en provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}" });
                //result.data = resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid)
        {
            var result = new Result<List<MailRelation>>();
            var userMail = await GetUser(user);
            var cuenta = userMail.data?.accounts?.Find(x => x.email == mail && x.provider == provider);
            result.data = cuenta?.mails?.FindAll(c => c.uid == uid);

            return result;
        }

        public async Task<Result<bool>> UpSertAccountConfig(string user, string provider, string mail, ConfigImapAccount config)
        {
            var result = new Result<bool>();

            var arrayFilters = GetFilterFromAccount(provider, mail);

            try
            {
                var resultUpdate = await _context.Accounts.UpdateOneAsync(
                    GetFilterUser(user),
                    Builders<UserMail>.Update.Set($"accounts.$[i].configAccount", config),
                    new UpdateOptions { ArrayFilters = arrayFilters }
                );

                if (!resultUpdate.IsAcknowledged)
                {
                    TraceMessage(result.errors, new Exception($"Don´t insert or modify the account config"), "1003");
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, $"Se modifica el usuario {user} creando o modificando la configuracion de cuenta {provider}-{mail} con imap: {config.imap} port: {config.imapPort} user a {config.imapUser}");
                    result.data = resultUpdate.ModifiedCount > 0;
                }

            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        #region Common

        private void ReviewUserMail(UserMail userMail)
        {
            userMail.User = userMail.User.ToUpperInvariant();
            if (userMail.accounts.Count > 0)
            {
                foreach (var acc in userMail.accounts)
                {
                    ReviewAccountMail(acc);

                }
            }

        }

        private static Predicate<Account> GetFilterProviderMail(string provider, string mail)
        {
            return x => x.email.Equals(mail.ToLowerInvariant())
                                    && x.provider.Equals(provider.ToUpperInvariant());
        }

        private static void ReviewAccountMail(Account acc)
        {
            acc.provider = acc.provider.ToUpperInvariant();
            acc.email = acc.email.ToLowerInvariant();
            acc.defaultAccount = true;
            if (acc.mails == null)
                acc.mails = new List<MailRelation>();
        }

        private static UpdateOptions GetUpsertOptions()
        {
            return new UpdateOptions { IsUpsert = true };
        }

        private static List<ArrayFilterDefinition> GetFilterFromAccount(string provider, string mail)
        {
            var arrayFilters = new List<ArrayFilterDefinition>();
            var dictionary = new Dictionary<string, string>
            {
                { "i.provider", provider },
                { "i.email", mail }
            };
            var doc = new BsonDocument(dictionary);
            var docarrayFilter = new BsonDocumentArrayFilterDefinition<BsonDocument>(doc);
            arrayFilters.Add(docarrayFilter);
            return arrayFilters;
        }

        private static UpdateOptions FindAccountsDefaultsInCollection()
        {
            return new UpdateOptions
            {
                ArrayFilters = new List<ArrayFilterDefinition>
                    {
                        new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("i.defaultAccount", true))
                    }
            };
        }

        private static FilterDefinition<UserMail> GetFilterUser(string idUser, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<UserMail>.Filter.And(
                Builders<UserMail>.Filter.Eq(u => u.User, idUser.ToUpperInvariant()),
                Builders<UserMail>.Filter.Eq(u => u.state, true));
            }

            return Builders<UserMail>.Filter.Eq(u => u.User, idUser.ToUpperInvariant());
        }

        private static UserMail GetNewUserMail(string user, string email, string provider, string guid)
        {
            return new UserMail()
            {
                User = user.ToUpperInvariant(),
                configUser = new ConfigUserLexon() { defaultAdjunction = "onlyAdjunction", defaultEntity = "files", getContacts = false },
                state = true,
                accounts = new List<Account>() {
                        new Account() {defaultAccount = true, email= email.ToLowerInvariant(), guid= guid, provider= provider.ToUpperInvariant() , mails = new List<MailRelation>()}
                    }
            };
        }

        public async Task<Result<long>> Remove(string user)
        {
            var result = new Result<long>();
            try
            {
                var resultRemove = await _context.Accounts.DeleteOneAsync(GetFilterUser(user, false));
                result.data = resultRemove.DeletedCount;
                //var eventAssoc = new AddOperationAccountIntegrationEvent(accountRemove.User, accountRemove.Provider, accountRemove.Email, accountRemove.DefaultAccount, EnTypeOperation.Remove);
                //_eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        #endregion Common
    }
}