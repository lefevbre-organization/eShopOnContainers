namespace Account.API.Infrastructure.Services
{
    #region Using

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Model;

    #endregion

    public interface IAccountsService
    {
        Task<List<Account>> Get();
        Task<Account> Get(string id);
        Task Create(Account account);
        Task Remove(string id);
        Task Update(string id, Account accountIn);
        Task<List<Account>> GetByUser(string user);
        Task UpdateDefaultAccount(string user, string provider, string email);
        Task<bool> DeleteAccountByUserAndProvider(string user, string provider);
        Task<bool> DeleteAccountByUserAndEmail(string user, string email);
        Task<bool> ResetDefaultAccountByUser(string user);
    }
}