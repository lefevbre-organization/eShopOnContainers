namespace Account.API.Infrastructure.Services
{
    using Account.API.Model;
    #region Using

    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Model;
    using Repositories;
    using System;
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
        {
            return await _accountsRepository.Create(account);
        }

        #region old

        public async Task<Result<AccountList>> GetByUser(string user)
        {
            return await _accountsRepository.GetByUser(user);
        }

        #endregion old

        public async Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid)
        {
            return await _accountsRepository.UpdateDefaultAccount(user, email, provider, guid);
        }

        public async Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email)
        {
            return await _accountsRepository.DeleteAccountByUserAndEmail(user, email);
        }

        public async Task<Result<long>> ResetDefaultAccountByUser(string user)
        {
            return await _accountsRepository.ResetDefaultAccountByUser(user);
        }

        public async Task<Result<long>> UpSertAccount(string user, Account accountIn)
        {
            return await _accountsRepository.UpSertAccount(user, accountIn);
        }

        public async Task<Result<Account>> GetAccount(string user, string mail)
        {
            return await _accountsRepository.GetAccount(user, mail);
        }

        public async Task<Result<Account>> GetDefaultAccount(string user)
        {
            return await _accountsRepository.GetDefaultAccount(user);
        }

        public async Task<Result<UserMail>> RemoveAccount(string user, string mail)
        {
            return await _accountsRepository.RemoveAccount(user, mail);
        }

        public async Task<Result<UserMail>> GetUser(string user)
        {
            return await _accountsRepository.GetUser(user);
        }

        public async Task<Result<bool>> ChangueState(string user, bool state)
        {
            return await _accountsRepository.ChangueState(user, state);
        }
    }
}