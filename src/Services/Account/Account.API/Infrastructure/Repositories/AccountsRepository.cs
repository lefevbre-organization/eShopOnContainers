namespace Account.API.Infrastructure.Repositories
{

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
    using System.Threading.Tasks;


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

        #region User

        public async Task<Result<UserMail>> Create(UserMail userMail)
        {
            var result = new Result<UserMail>();
            ReviewUserMail(userMail);

            try
            {
                var resultReplace = await _context.Accounts.ReplaceOneAsync(GetFilterUser(userMail.User, false), userMail, GetUpsertOptions());

                userMail.Id = ManageCreateUser($"Don´t insert or modify the user {userMail.User}",
                    $"Se modifica el usuario {userMail.User}",
                    $"Se inserta el usuario {userMail.User} con {resultReplace.UpsertedId}",
                     result, resultReplace);

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

        private string ManageCreateUser(string msgError, string msgModify, string msgInsert, Result<UserMail> result, ReplaceOneResult resultReplace)
        {
            if (!resultReplace.IsAcknowledged)
            {
                TraceMessage(result.errors, new Exception(msgError), "1003");
            }
            else if (resultReplace.IsAcknowledged && resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
            {
                TraceInfo(result.infos, msgModify);
            }
            else if (resultReplace.IsAcknowledged && resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
            {
                TraceInfo(result.infos, msgInsert);
                return resultReplace.UpsertedId.ToString();
            }
            return null;
        }

        public async Task<Result<UserMail>> GetUser(string user)
        {
            var result = new Result<UserMail>();
            try
            {
                result.data = await _context.Accounts.Find(GetFilterUser(user)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún usuario {user}"), "1003");
                //TraceInfo(result.infos, $"No se encuentra ningún usuario {user}");
                else
                {
                    var orderAccounts = result.data?.accounts.OrderByDescending(x => x.defaultAccount).ToList();
                    if (orderAccounts != null)
                        result.data.accounts = orderAccounts;
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<bool>> Remove(string user)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.Accounts.DeleteOneAsync(GetFilterUser(user, false));
                result.data = resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    var eventAssoc = new RemoveUserMailIntegrationEvent(user);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
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

                ManageUpdate($"Don´t changue the state of user", $"Se pone el usuario {user} en estado :{state}", result, resultUpdate);

                if (result.data)
                {
                    var eventAssoc = new ChangueStateUserMailIntegrationEvent(user, state);
                    _eventBus.Publish(eventAssoc);
                }
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

                ManageUpdate($"Don´t insert or modify the user´s config",
                    $"Se modifica la configuración del usuario {user} con adjunction: {config.defaultAdjunction} - entity: {config.defaultEntity} - getContacts: {config.getContacts}",
                    result, resultUpdate);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        #endregion User

        #region Accounts

        public async Task<Result<Account>> GetAccount(string user, string provider, string mail)
        {
            var result = new Result<Account>();
            try
            {
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).FirstOrDefaultAsync();

                if (usuario == null)
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún usuario {user} del que obtener cuenta"), "1003");
              //  TraceInfo(result.infos, $"No se encuentra ningún usuario {user} del que obtener cuenta");
                else
                {
                    result.data = usuario.accounts?.Find(GetFilterProviderMail(provider, mail));
                    if (result.data == null)
                        TraceInfo(result.infos, $"No se encuentra ningúna cuenta {provider} - {mail} en ese usuario {user}");
                }
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
                var usuario = await _context.Accounts.Find(GetFilterUser(user)).FirstOrDefaultAsync();
                if (usuario == null)
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún usuario {user} del que obtener cuenta x defecto"), "1003");
                else
                {
                    result.data = usuario?.accounts.Find(x => x.defaultAccount == true);
                    if (result.data == null)
                        TraceInfo(result.infos, $"No se encuentra ningúna cuenta por defecto en ese usuario {user}");
                }
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
                    f => f.email.Equals(mail.ToLowerInvariant()) && f.provider.Equals(provider.ToUpperInvariant())
                    );
                var userUpdate = await _context.Accounts.FindOneAndUpdateAsync<UserMail>(
                    GetFilterUser(user),
                    update, options);

                if (userUpdate != null)
                {
                    result.data = userUpdate;
                    var eventAssoc = new RemoveAccountIntegrationEvent(user, provider, mail);
                    _eventBus.Publish(eventAssoc);
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

        public async Task<Result<bool>> ResetDefaultAccountByUser(string user)
        {
            var result = new Result<bool>();
            try
            {
                var resultUpdate = await _context.Accounts.UpdateManyAsync(
                    account => account.User == user,
                    Builders<UserMail>.Update
                        .Set("accounts.$[i].defaultAccount", false),
                        FindAccountsDefaultsInCollection()
                    );

                ManageUpdate("Error when reset defaults accounts", $"Reset Accounts of {user}", result, resultUpdate);
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<bool>> UpSertAccount(string user, Account accountIn)
        {
            var result = new Result<bool>();
            ReviewAccountMail(accountIn);

            try
            {
                var userMail = GetNewUserMail(user, accountIn.email, accountIn.provider, accountIn.guid);

                var userDb = await _context.Accounts.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userMail;
                    TraceInfo(result.infos, $"Se inserta el usuario {userMail.User}");

                    var eventAssoc = new AddUserMailIntegrationEvent(userMail.User, userMail.configUser);
                    _eventBus.Publish(eventAssoc);
                }
                else
                {
                    OperateChanguesInUserAccounts(user, accountIn, result, userDb);
                }
                var resultReplace = await _context.Accounts.ReplaceOneAsync(GetFilterUser(userMail.User), userDb, GetUpsertOptions());

                if (resultReplace.IsAcknowledged && resultReplace.IsModifiedCountAvailable)
                {
                    var eventAssoc = new UpsertAccountIntegrationEvent(userMail.User, accountIn.provider, accountIn.email, accountIn.defaultAccount, accountIn.configAccount);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            result.data = true;
            return result;
        }

        private void OperateChanguesInUserAccounts(string user, Account accountIn, Result<bool> result, UserMail userDb)
        {
            userDb.accounts.ForEach(x => x.defaultAccount = false);
            var accountDb = userDb.accounts.Find(GetFilterProviderMail(accountIn.provider, accountIn.email));

            if (accountDb == null)
            {
                userDb.accounts.Add(accountIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo una cuenta para {accountIn.provider}-{accountIn.email}");
            }
            else
            {
                UpdateAccountWithOther(accountIn, accountDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la cuenta para {accountIn.provider}-{accountIn.email}");
            }
        }

        private static void UpdateAccountWithOther(Account accountIn, Account accountDb)
        {
            accountDb.guid = accountIn.guid;
            accountDb.sign = accountIn.sign;
            accountDb.defaultAccount = accountIn.defaultAccount;
            if (accountIn.configAccount != null)
                accountDb.configAccount = accountIn.configAccount;
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

        #endregion Accounts

        #region Relations

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

                ManageUpdate($"Don´t insert or modify the relation in user {user}",
                    $"Se añade relación al usuario {user} y provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}",
                    result, resultUpdate);

                //if (!resultUpdate.IsAcknowledged)
                //{
                //    TraceMessage(result.errors, new Exception($"Don´t insert or modify the relation"), "1003");
                //}
                //else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                //{
                //    TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo la relacion en el provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}");
                //    result.data = resultUpdate.ModifiedCount > 0;
                //}

                //TraceLog(parameters: new string[] { $"Se añade relacion en provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}" });
                //result.data = resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0;
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

                ManageUpdate($"Don´t remove the relation in user {user}",
                    $"Se elimina relación en usuario {user} y provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}",
                    result, resultUpdate);

                //if (!resultUpdate.IsAcknowledged)
                //{
                //    TraceMessage(result.errors, new Exception($"Don´t insert or modify the relation"), "1003");
                //}
                //else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                //{
                //    TraceInfo(result.infos, $"Se modifica el usuario {user} quitando la relacion en el provider/cuenta {provider}/{mail}/{relation.uid} con app/id {relation.app}/{relation.idEntity}");
                //    result.data = resultUpdate.ModifiedCount > 0;
                //}

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
            try
            {
                var resultUser = await GetUser(user);

                if (resultUser.data?.accounts?.Count > 0)
                {
                    var cuenta = resultUser.data?.accounts?.Find(GetFilterProviderMail(provider, mail));
                    result.data = cuenta?.mails?.FindAll(c => c.uid == uid);

                    if (result.data == null)
                        TraceInfo(result.infos, $"No se encuentra ningúna relación en la cuenta {provider} - {mail} del usuario {user}");
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        #endregion Relations

        #region Common

        private void ManageUpdate(string errorMsg, string modifyMsg, Result<bool> result, UpdateResult resultUpdate)
        {
            if (!resultUpdate.IsAcknowledged)
            {
                TraceMessage(result.errors, new Exception(errorMsg), "1003");
            }
            else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
            {
                TraceInfo(result.infos, modifyMsg);
                result.data = resultUpdate.ModifiedCount > 0;
            }
        }

        private void ReviewUserMail(UserMail userMail)
        {
            userMail.User = userMail.User.ToUpperInvariant();
            if (userMail.configUser == null)
                userMail.configUser = AddConfigDefault();

            if (userMail.accounts.Count > 0)
            {
                foreach (var acc in userMail.accounts)
                {
                    ReviewAccountMail(acc);
                }
            }
        }

        private static void ReviewAccountMail(Account acc)
        {
            acc.provider = acc.provider.ToUpperInvariant();
            acc.email = acc.email.ToLowerInvariant();
            acc.defaultAccount = true;
            if (acc.mails == null)
                acc.mails = new List<MailRelation>();
        }

        private static Predicate<Account> GetFilterProviderMail(string provider, string mail)
        {
            return x => x.email.Equals(mail.ToLowerInvariant())
                                    && x.provider.Equals(provider.ToUpperInvariant());
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

        private UserMail GetNewUserMail(string user, string email, string provider, string guid)
        {
            return new UserMail()
            {
                User = user.ToUpperInvariant(),
                configUser = AddConfigDefault(),
                state = true,
                accounts = new List<Account>() {
                        new Account() {defaultAccount = true, email= email.ToLowerInvariant(), guid= guid, provider= provider.ToUpperInvariant() , mails = new List<MailRelation>()}
                    }
            };
        }

        private ConfigUserLexon AddConfigDefault()
        {
            return new ConfigUserLexon() { defaultAdjunction = "onlyAdjunction", defaultEntity = "files", getContacts = false };
        }

        #endregion Common
    }
}