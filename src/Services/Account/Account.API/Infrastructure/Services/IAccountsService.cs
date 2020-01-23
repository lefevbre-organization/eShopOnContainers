namespace Account.API.Infrastructure.Services
{
    #region Using

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Account.API.Model;
    using Model;

    #endregion

    public interface IAccountsService
    {
        //Task<Result<AccountList>> Get();
        //Task<Result<UserMail>> Get(string id);
        Task<Result<UserMail>> Create(UserMail account);
        Task<Result<long>> Remove(string id);
        //Task<Result<long>> Update(string id, UserMail accountIn);
        Task<Result<AccountList>> GetByUser(string user);
        Task<Result<long>> UpdateDefaultAccount(string user, string provider, string email, string guid);
        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);
        Task<Result<long>> ResetDefaultAccountByUser(string user);
        Task<Result<long>> UpSertAccount(string user, Account accountIn);
    }
}