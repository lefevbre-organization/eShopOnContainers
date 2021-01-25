namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Repositories
{
    #region using

    using IntegrationEvents.Events;
    using Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Exceptions;
    using Lefebvre.eLefebvreOnContainers.Services.Account.API.Model;
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

    #endregion using

    public class AccountsRepository : AccountsBaseClass<AccountsRepository>, IAccountsRepository
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

                userMail.Id = ManageUpsert<UserMail>($"Don´t insert or modify the user {userMail.User}",
                    $"Se modifica el usuario {userMail.User}",
                    $"Se inserta el usuario {userMail.User} con {resultReplace.UpsertedId}",
                     result, resultReplace, "AC02");

                result.data = userMail;

                var eventAssoc = new AddUserMailIntegrationEvent(userMail.User, userMail.configUser);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when create user mail", ex),
                           Codes.MailAccounts.UserCreate,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<UserMail>> GetUser(string user)
        {
            var result = new Result<UserMail>();
            try
            {
                result.data = await _context.Accounts.Find(GetFilterUser(user)).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors,
                               new AccountDomainException($"No se encuentra ningún usuario {user}"),
                               Codes.MailAccounts.UserGet,
                               Codes.Areas.Mongo);
                }
                else
                {
                    var orderAccounts = result.data?.accounts.OrderByDescending(x => x.defaultAccount).ToList();
                    if (orderAccounts != null)
                        result.data.accounts = orderAccounts;
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when get UserMail", ex),
                           Codes.MailAccounts.UserGet,
                           Codes.Areas.Mongo);
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

                ManageUpdate($"Don´t changue the state of user", $"Se pone el usuario {user} en estado {state}", result, resultUpdate, Codes.MailAccounts.UserStateChangue);

                if (result.data)
                {
                    var eventAssoc = new ChangueStateUserMailIntegrationEvent(user, state);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when changue state of UserMail", ex),
                           Codes.MailAccounts.UserStateChangue,
                           Codes.Areas.Mongo);
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
                    result, resultUpdate, Codes.MailAccounts.UserConfigUpsert);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when upsert config of UserMail", ex),
                           Codes.MailAccounts.UserConfigUpsert,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        public async Task<Result<bool>> Remove(string user)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.Accounts.DeleteOneAsync(GetFilterUser(user, false));
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {user}", Codes.MailAccounts.UserRemove);
                    var eventAssoc = new RemoveUserMailIntegrationEvent(user);
                    _eventBus.Publish(eventAssoc);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when remove UserMail", ex),
                           Codes.MailAccounts.UserRemove,
                           Codes.Areas.Mongo);
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
                {
                    TraceError(result.errors,
                               new AccountDomainException($"No se encuentra ningún usuario {user} del que obtener cuenta"),
                               Codes.MailAccounts.AccountGet,
                               Codes.Areas.Mongo);
                }
                else
                {
                    result.data = usuario.accounts?.Find(GetFilterProviderMail(provider, mail));
                    if (result.data == null)
                        TraceInfo(result.infos, $"No se encuentra ningúna cuenta {provider} - {mail} en ese usuario {user}", Codes.MailAccounts.AccountGet);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException("Error when get Account", ex),
                           Codes.MailAccounts.AccountGet,
                           Codes.Areas.Mongo);
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
                {
                    TraceError(result.errors,
                               new AccountDomainException($"No se encuentra ningún usuario {user} del que obtener cuenta x defecto"),
                               Codes.MailAccounts.AccountGetDefault,
                               Codes.Areas.Mongo);
                }
                else
                {
                    result.data = usuario?.accounts.Find(x => x.defaultAccount == true);
                    if (result.data == null)
                        TraceInfo(result.infos, $"No se encuentra ningúna cuenta por defecto en ese usuario {user}", Codes.MailAccounts.AccountGetDefault);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error al obtener cuenta por defecto de {user}", ex),
                           Codes.MailAccounts.AccountGetDefault,
                           Codes.Areas.Mongo);
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
                    TraceInfo(result.infos, $"Se ha removido la cuenta {provider}-{mail} del usuario {user}", Codes.MailAccounts.AccountRemove);
                    result.data = userUpdate;
                    var eventAssoc = new RemoveAccountIntegrationEvent(user, provider, mail);
                    _eventBus.Publish(eventAssoc);
                }
                else
                {
                    TraceInfo(result.infos, $"No se encuentra ningún usuario {user} del que quitar la cuenta {provider}-{mail}", Codes.MailAccounts.AccountRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove account of {user}", ex),
                           Codes.MailAccounts.AccountRemove,
                           Codes.Areas.Mongo);
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

                ManageUpdate("Error when reset defaults accounts", $"Reset Accounts of {user}", result, resultUpdate, Codes.MailAccounts.AccountResetDefault);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when reset defaut account of {user}", ex),
                           Codes.MailAccounts.AccountResetDefault,
                           Codes.Areas.Mongo);
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
                    TraceInfo(result.infos, $"Se inserta el usuario {userMail.User} al crear la cuenta {accountIn.email}", Codes.MailAccounts.AccountUpsert);

                    var eventAssoc = new UpsertAccountIntegrationEvent(userMail.User, accountIn.provider, accountIn.email, accountIn.defaultAccount, accountIn.configAccount, true);
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
                TraceError(result.errors,
                           new AccountDomainException($"Error when upsert account of {user}", ex),
                           Codes.MailAccounts.AccountUpsert,
                           Codes.Areas.Mongo);
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
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo una cuenta para {accountIn.provider}-{accountIn.email}", Codes.MailAccounts.AccountUpsert);
            }
            else
            {
                UpdateAccountWithOther(accountIn, accountDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la cuenta para {accountIn.provider}-{accountIn.email}", Codes.MailAccounts.AccountUpsert);
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
                    TraceError(result.errors,
                               new AccountDomainException($"Don´t insert or modify the account config"),
                               Codes.MailAccounts.AccountConfigUpsert,
                               Codes.Areas.Mongo);
                }
                else if (resultUpdate.IsAcknowledged && resultUpdate.MatchedCount > 0 && resultUpdate.ModifiedCount > 0)
                {
                    TraceInfo(result.infos,
                              $"Se modifica el usuario {user} creando o modificando la configuracion de cuenta {provider}-{mail} con imap: {config.imap} port: {config.imapPort} user: {config.imapUser}",
                              Codes.MailAccounts.AccountConfigUpsert);
                    result.data = resultUpdate.ModifiedCount > 0;
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when upsert account config of {user}", ex),
                           Codes.MailAccounts.AccountConfigUpsert,
                           Codes.Areas.Mongo);
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
                    $"Se añade relación en el usuario {user} y cuenta {provider}-{mail}, para el mail: {relation.uid} app: {relation.app} id:{relation.idEntity}",
                    result, resultUpdate, Codes.MailAccounts.RelationUpsert);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when upsert relation of {user}", ex),
                           Codes.MailAccounts.RelationUpsert,
                           Codes.Areas.Mongo);
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
                    $"Se elimina relación en el usuario {user} y cuenta {provider}-{mail}, para el mail: {relation.uid} app: {relation.app} id:{relation.idEntity}",
                    result, resultUpdate, Codes.MailAccounts.RelationRemove);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove relation of {user}", ex),
                           Codes.MailAccounts.RelationRemove,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        public async Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid)
        {
            var result = new Result<List<MailRelation>>();
            try
            {
                var resultUser = await GetUser(user);
                if (resultUser.data == null)
                {
                    TraceError(result.errors,
                               new Exception($"No se encuentra ningún usuario {user}"),
                               Codes.MailAccounts.RelationGet,
                               Codes.Areas.Mongo);
                }
                else
                {
                    if (resultUser.data?.accounts?.Count > 0)
                    {
                        var cuenta = resultUser.data?.accounts?.Find(GetFilterProviderMail(provider, mail));
                        result.data = cuenta?.mails?.FindAll(c => c.uid == uid);

                        if (result.data == null)
                            TraceInfo(result.infos, $"No se encuentra ningúna relación en la cuenta {provider} - {mail} del usuario {user}", Codes.MailAccounts.RelationGet);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when get relations of {user}", ex),
                           Codes.MailAccounts.RelationGet,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        #endregion Relations

        #region Common


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

        private void ReviewAccountEventsMail(AccountEventTypes account)
        {
            account.email = account.email.ToUpperInvariant();

            var eventsList = account.eventTypes.ToList();

            if (eventsList.Count > 0)
            {
                foreach (var ev in eventsList)
                {
                    ReviewEvents(ev);
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

        private void ReviewRawMessage(RawMessageProvider rawMessage)
        {
            rawMessage.User = rawMessage.User.ToUpperInvariant();
            rawMessage.Provider = rawMessage.Provider.ToUpperInvariant();
            rawMessage.Account = rawMessage.Account.ToUpperInvariant();
            rawMessage.MessageId = rawMessage.MessageId.ToUpperInvariant();
        }

        private static void ReviewEvents(EventType eve)
        {
            if (string.IsNullOrEmpty(eve.idEvent))
                eve.idEvent = Guid.NewGuid().ToString();
            eve.name = eve.name.Trim();
            eve.color = eve.color.Trim();
        }

        private static Predicate<Account> GetFilterProviderMail(string provider, string mail)
        {
            return x => x.email.Equals(mail.ToLowerInvariant())
                                    && x.provider.Equals(provider.ToUpperInvariant());
        }

        private static List<ArrayFilterDefinition> GetFilterFromAccount(string provider, string mail)
        {
            var arrayFilters = new List<ArrayFilterDefinition>();
            var dictionary = new Dictionary<string, string>
            {
                { "i.provider", provider.ToUpperInvariant() },
                { "i.email", mail.ToLowerInvariant() }
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

        private static FilterDefinition<AccountEventTypes> GetFilterAccountEvents(string mail)
        {
            return Builders<AccountEventTypes>.Filter.Eq(u => u.email, mail.ToUpperInvariant());
        }

        private static FilterDefinition<RawMessageProvider> GetFilterRawMessage(string idUser, string provider, string account, string messageId)
        {
            return Builders<RawMessageProvider>.Filter.And(
                Builders<RawMessageProvider>.Filter.Eq(u => u.User, idUser.ToUpperInvariant()),
                Builders<RawMessageProvider>.Filter.Eq(u => u.Provider, provider.ToUpperInvariant()),
                Builders<RawMessageProvider>.Filter.Eq(u => u.Account, account.ToUpperInvariant()),
                Builders<RawMessageProvider>.Filter.Eq(u => u.MessageId, messageId.ToUpperInvariant())
                );
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

        #region RawMessage

        public async Task<Result<RawMessageProvider>> GetRawUser(string user, string provider, string account, string messageId)
        {
            var result = new Result<RawMessageProvider>();
            try
            {
                result.data = await _context.RawMessages.Find(GetFilterRawMessage(user, provider, account, messageId)).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors,
                               new AccountDomainException($"Don´t exist {user} to get the raw"),
                               Codes.MailAccounts.RawGet,
                               Codes.Areas.Mongo);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when get raw of {user}", ex),
                           Codes.MailAccounts.RawGet,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<RawMessageProvider>> CreateRaw(RawMessageProvider rawMessage)
        {
            var result = new Result<RawMessageProvider>();
            ReviewRawMessage(rawMessage);

            try
            {
                var resultReplace = await _context.RawMessages.ReplaceOneAsync(
                    GetFilterRawMessage(rawMessage.User, rawMessage.Provider, rawMessage.Account, rawMessage.MessageId),
                    rawMessage,
                    GetUpsertOptions());

                rawMessage.Id = ManageUpsert<RawMessageProvider>($"Don´t insert or modify the raw {rawMessage.User}",
                    $"Se modifica el usuario {rawMessage.User}",
                    $"Se inserta el usuario {rawMessage.User} con {resultReplace.UpsertedId}",
                     result, resultReplace, "AC31");

                result.data = rawMessage;

                var eventAssoc = new AddRawMessageIntegrationEvent(rawMessage.User);
                _eventBus.Publish(eventAssoc);
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when insert raw in {rawMessage.User}", ex),
                           Codes.MailAccounts.RawCreate,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<bool>> DeleteRaw(RawMessageProvider rawMessage)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.RawMessages.DeleteOneAsync(
                    GetFilterRawMessage(rawMessage.User, rawMessage.Provider, rawMessage.Account, rawMessage.MessageId));

                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente el raw de {rawMessage.MessageId}", Codes.MailAccounts.RawRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove raw in {rawMessage.User}", ex),
                           Codes.MailAccounts.RawRemove,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        #endregion RawMessage

        #region EventTypes

        public async Task<Result<AccountEventTypes>> GetEventTypesByAccount(string account)
        {
            var result = new Result<AccountEventTypes>();
            try
            {
                result.data = await _context.AccountEvents.Find(GetFilterAccountEvents(account)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceInfo(result.infos, $"No se encuentra ningún EventTypes para esa cuenta {account}", Codes.MailAccounts.EventTypeGet);
                else
                {
                    var orderEvents = result.data?.eventTypes.OrderByDescending(x => x.name).ToList();
                    if (orderEvents != null)
                        result.data.eventTypes = orderEvents.ToArray();
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when get EventTypes of {account}", ex),
                           Codes.MailAccounts.EventTypeGet,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<AccountEventTypes>> UpsertAccountEventTypes(AccountEventTypes accountIn)
        {
            var result = new Result<AccountEventTypes>();
            ReviewAccountEventsMail(accountIn);

            try
            {
                var resultReplace = await _context.AccountEvents.ReplaceOneAsync(GetFilterAccountEvents(accountIn.email), accountIn, GetUpsertOptions());

                accountIn.Id = ManageUpsert<AccountEventTypes>($"Don´t insert or modify the user {accountIn.email}",
                    $"Se modifica la cuenta {accountIn.email}",
                    $"Se inserta la cuenta {accountIn.email} con {resultReplace.UpsertedId}",
                     result, resultReplace, "AC41");

                result.data = accountIn;
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when upsert EventTypes of {accountIn.email}", ex),
                           Codes.MailAccounts.EventTypeUpsert,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<bool>> RemoveEventType(string email, string idEvent)
        {
            var result = new Result<bool>();
            var resultAccount = new Result<AccountEventTypes>();
            var options = new FindOneAndUpdateOptions<AccountEventTypes> { ReturnDocument = ReturnDocument.After };
            try
            {
                var update = Builders<AccountEventTypes>.Update.PullFilter(
                    p => p.eventTypes,
                    f => f.idEvent.Equals(idEvent.ToLowerInvariant())
                    );

                var userUpdate = await _context.AccountEvents.FindOneAndUpdateAsync<AccountEventTypes>(
                    GetFilterAccountEvents(email),
                    update, options);

                if (userUpdate != null)
                {
                    TraceInfo(result.infos, $"Se ha removido el evento {idEvent} de la cuenta {email}", Codes.MailAccounts.EventTypeRemove);
                    resultAccount.data = userUpdate;
                    result.data = true;
                }
                else
                {
                    TraceInfo(result.infos, $"No se encuentra la cuenta {email} para remover el evento {idEvent}", Codes.MailAccounts.EventTypeRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove EventTypes of {email}", ex),
                           Codes.MailAccounts.EventTypeRemove,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        public async Task<Result<EventType>> AddEventType(string email, EventType eventType)
        {
            var resultBoolean = new Result<bool>();
            var result = new Result<EventType>();
            var IdEventDontExistImNew = eventType.idEvent == null;
            ReviewEvents(eventType);

            try
            {
                var account = await _context.AccountEvents.FindAsync(c => c.email.Equals(email.ToUpperInvariant())).Result.FirstOrDefaultAsync();

                if (account == null)
                {
                    var arrayEvents = new List<EventType> { eventType };

                    var resultInsertAccountEvent = await UpsertAccountEventTypes(new AccountEventTypes() { email = email, eventTypes = arrayEvents.ToArray() });
                    account = resultInsertAccountEvent.data;
                }
                else
                {
                    if (IdEventDontExistImNew)
                        InsertEventType(account, eventType, result);
                    else
                        UpdateEventType(account, eventType, result);

                    await _context.AccountEvents.ReplaceOneAsync(c => c.Id == account.Id, account);
                }

                result.data = eventType;
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when add EventTypes of {email}", ex),
                           Codes.MailAccounts.EventTypeAdd,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        private void InsertEventType(AccountEventTypes account, EventType eventType, Result<EventType> result)
        {
            //TODO: cambiar "EventIdExist"
            var ev = account.eventTypes.FirstOrDefault(s => s.idEvent == eventType.idEvent);
            if (ev == null)
            {
                var evByName = account.eventTypes.FirstOrDefault(s => s.name.ToUpperInvariant().Equals(eventType.name.ToUpperInvariant()));
                if (evByName != null)
                {
                    TraceError(result.errors,
                               new AccountDomainException($"Error, exist other eventType with same name {eventType.name}, review it"),
                               Codes.MailAccounts.EventTypeAdd,
                               Codes.Areas.Mongo);
                }
                else
                {
                    var listEvents = account.eventTypes.ToList();

                    listEvents.Add(eventType);
                    account.eventTypes = listEvents.ToArray();
                    TraceInfo(result.infos, $"insert new eventType {eventType.idEvent}-{eventType.name}", Codes.MailAccounts.EventTypeAdd);
                }
            }
            else
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error, eventType id exist, review {eventType.idEvent}  or correct account"),
                           Codes.MailAccounts.EventTypeAdd,
                           Codes.Areas.Mongo);
            }
        }

        private void UpdateEventType(AccountEventTypes account, EventType eventType, Result<EventType> result)
        {
            //TODO: quitar EventIdUnknow
            var ev = account.eventTypes.FirstOrDefault(s => s.idEvent == eventType.idEvent);
            if (ev == null)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error, eventType id don´t exist, review {eventType.idEvent}  or correct account"),
                           Codes.MailAccounts.EventTypeAdd,
                           Codes.Areas.Mongo);
            }
            else
            {
                ev.name = eventType.name;
                ev.color = eventType.color;

                if (ev.name.ToUpperInvariant() == eventType.name?.ToUpperInvariant())
                    TraceInfo(result.infos, $"Same name, modify eventType {ev.idEvent} -> {ev.name} with new color", Codes.MailAccounts.EventTypeAdd);
                else
                    TraceInfo(result.infos, $"Modify eventType {ev.idEvent} -> {ev.name} with {ev.color}", Codes.MailAccounts.EventTypeAdd);
            }
        }

        public async Task<Result<bool>> RemoveAccountEventType(string email)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.AccountEvents.DeleteOneAsync(GetFilterAccountEvents(email));
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {email}", Codes.MailAccounts.EventTypeRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove eventType of {email}", ex),
                           Codes.MailAccounts.EventTypeRemove,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        #endregion EventTypes
    }
}