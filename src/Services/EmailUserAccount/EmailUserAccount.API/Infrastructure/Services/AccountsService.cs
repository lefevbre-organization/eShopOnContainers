namespace EmailUserAccount.API.Infrastructure.Services
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

        public async Task<List<Account>> GetListAccountsAsync(int pageSize, int pageIndex)
        {
            return await _accountsRepository.GetListAsync(pageSize, pageIndex);
        }

        public async Task<List<Account>> GetListAccountsByUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _accountsRepository.GetListByUserAsync(pageSize, pageIndex, idUser);
        }
    }
}