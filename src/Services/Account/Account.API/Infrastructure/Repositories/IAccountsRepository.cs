namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Model;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using IntegrationEvents.Events;

    #endregion

    public interface IAccountsRepository
    {
        Task<List<Account>> Get();
        Task<Account> Get(string id);        
        Task Create(Account account);
        Task Remove(string id);
        Task Update(string id, Account accountIn);
        Task<List<Account>> GetByUser(string user);
        Task UpdateDefaultAccount(string user, string provider, string email);
        Task<bool> DeleteAccountByUserAndProvider(string user, string provider);
        Task<bool> ResetDefaultAccountByUser(string user);

        Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation);
    }
}