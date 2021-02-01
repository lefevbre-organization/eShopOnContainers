namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Services
{
    #region Using

    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Repositories;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    #endregion Using

    public class AccountsService : IAccountsService
    {
        public readonly IAccountsRepository _accountsRepository;
        private readonly IEventBus _eventBus;

        public AccountsService(
            IAccountsRepository accountRepository,
            IEventBus eventBus)
        {
            _accountsRepository = accountRepository ?? throw new ArgumentNullException(nameof(accountRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        public async Task<Result<UserMail>> Create(UserMail account)
            => await _accountsRepository.Create(account);

        public async Task<Result<bool>> ResetDefaultAccountByUser(string user)
            => await _accountsRepository.ResetDefaultAccountByUser(user);

        public async Task<Result<bool>> UpSertAccount(string user, Account accountIn)
            => await _accountsRepository.UpSertAccount(user, accountIn);

        public async Task<Result<Account>> GetAccount(string user, string provider, string mail)
            => await _accountsRepository.GetAccount(user, provider, mail);

        public async Task<Result<Account>> GetDefaultAccount(string user)
            => await _accountsRepository.GetDefaultAccount(user);

        public async Task<Result<bool>> Remove(string user)
            => await _accountsRepository.Remove(user);

        public async Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail)
            => await _accountsRepository.RemoveAccount(user, provider, mail);

        public async Task<Result<UserMail>> GetUser(string user)
            => await _accountsRepository.GetUser(user);

        public async Task<Result<bool>> ChangueState(string user, bool state)
            => await _accountsRepository.ChangueState(user, state);

        public async Task<Result<bool>> UpSertUserConfig(string user, ConfigUserLexon config)
            => await _accountsRepository.UpSertConfig(user, config);

        public async Task<Result<bool>> UpSertRelationMail(string user, string provider, string mail, MailRelation relation)
            => await _accountsRepository.UpSertRelationMail(user, provider, mail, relation);

        public async Task<Result<bool>> RemoveRelationMail(string user, string provider, string mail, MailRelation relation)
            => await _accountsRepository.RemoveRelationMail(user, provider, mail, relation);

        public async Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid)
            => await _accountsRepository.GetRelationsFromMail(user, provider, mail, uid);

        public async Task<Result<bool>> UpSertAccountConfig(string user, string provider, string mail, ConfigImapAccount config)
            => await _accountsRepository.UpSertAccountConfig(user, provider, mail, config);

        public async Task<Result<RawMessageProvider>> GetRawUser(string user, string provider, string account, string messageId)
            => await _accountsRepository.GetRawUser(user, provider, account, messageId);

        public async Task<Result<RawMessageProvider>> CreateRaw(RawMessageProvider rawMessage)
            => await _accountsRepository.CreateRaw(rawMessage);

        public async Task<Result<bool>> DeleteRaw(RawMessageProvider rawMessage)
            => await _accountsRepository.DeleteRaw(rawMessage);
    }
}