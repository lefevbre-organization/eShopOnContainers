namespace Account.API.Infrastructure.Services
{
    #region Using

    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Repositories;
    using Model;

    #endregion

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

        public async Task<Result<AccountList>> Get()
        {
            return await _accountsRepository.Get();
        }

        public async Task<Result<Account>> Get(string id)
        {
            return await _accountsRepository.Get(id);
        }

        public async Task<Result<Account>> Create(Account account)
        {
            return await _accountsRepository.Create(account);
        }

        public async Task<Result<long>> Remove(string id)
        {
            return await _accountsRepository.Remove(id);
        }

        public async Task<Result<long>> Update(string id, Account account)
        {
            return await _accountsRepository.Update(id, account);
        }

        public async Task<Result<AccountList>> GetByUser(string user)
        {
            return await _accountsRepository.GetByUser(user);
        }

        public async Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider = null)
        {
            return await _accountsRepository.UpdateDefaultAccount(user, email, provider);
        }

        public async Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email)
        {
            return await _accountsRepository.DeleteAccountByUserAndEmail(user, email);
        }

        public async Task<Result<long>> ResetDefaultAccountByUser(string user)
        {
           return  await _accountsRepository.ResetDefaultAccountByUser(user);
        }
    }
}