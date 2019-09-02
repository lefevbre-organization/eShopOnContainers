namespace EmailUserAccount.API.Infrastructure.Services
{
    #region Using

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Model;

    #endregion

    public interface IAccountsService
    {
        Task<List<Account>> GetListAccountsAsync(int pageSize, int pageIndex);

        Task<List<Account>> GetListAccountsByUserAsync(int pageSize, int pageIndex, string idUser);
    }
}