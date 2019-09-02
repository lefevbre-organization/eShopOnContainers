namespace EmailUserAccount.API.Infrastructure.Repositories
{
    #region Using

    using Model;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using IntegrationEvents.Events;

    #endregion

    public interface IAccountsRepository
    {
        Task<Account> GetAsync(int idUser);
        Task<List<Account>> GetListAsync(int pageSize, int pageIndex);
        Task<List<Account>> GetListByUserAsync(int pageSize, int pageIndex, string idUser);
        Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation);
    }
}