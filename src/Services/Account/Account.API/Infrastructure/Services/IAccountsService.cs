namespace Account.API.Infrastructure.Services
{
    #region Using

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Model;

    #endregion

    public interface IAccountsService
    {
        Task<Result<AccountList>> Get();
        Task<Result<Account>> Get(string id);
        Task<Result<Account>> Create(Account account);
        Task<Result<long>> Remove(string id);
        Task<Result<long>> Update(string id, Account accountIn);
        Task<Result<AccountList>> GetByUser(string user);
        Task<Result<long>> UpdateDefaultAccount(string user, string provider, string email);
        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);
        Task<Result<long>> ResetDefaultAccountByUser(string user);
    }
}