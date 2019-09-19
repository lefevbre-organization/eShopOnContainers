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

        public async Task<List<Account>> Get()
        {
            return await _accountsRepository.Get();
        }

        public async Task<Account> Get(string id)
        {
            return await _accountsRepository.Get(id);
        }

        public async Task Create(Account account)
        {
            await _accountsRepository.Create(account);
        }

        public async Task Remove(string id)
        {
            await _accountsRepository.Remove(id);
        }

        public async Task Update(string id, Account account)
        {
            await _accountsRepository.Update(id, account);
        }

        public async Task<List<Account>> GetByUser(string user)
        {
            return await _accountsRepository.GetByUser(user);
        }

        public async Task UpdateDefaultAccount(string user, string provider, string email)
        {
            await _accountsRepository.UpdateDefaultAccount(user, provider, email);
        }

        public async Task<bool> DeleteAccountByUserAndProvider(string user, string provider)
        {
            return await _accountsRepository.DeleteAccountByUserAndProvider(user, provider);
        }
        public async Task<bool> DeleteAccountByUserAndEmail(string user, string email)
        {
            return await _accountsRepository.DeleteAccountByUserAndEmail(user, email);
        }

        public async Task<bool> ResetDefaultAccountByUser(string user)
        {
           return  await _accountsRepository.ResetDefaultAccountByUser(user);
        }
    }
}