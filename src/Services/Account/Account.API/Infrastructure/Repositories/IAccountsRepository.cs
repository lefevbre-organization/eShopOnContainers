namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Model;
    using System.Threading.Tasks;

    #endregion Using

    public interface IAccountsRepository
    {
        Task<Result<UserMail>> Create(UserMail account);

        //Task<Result<long>> Remove(string id);

        Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail);

        Task<Result<AccountList>> GetByUser(string user);

        Task<Result<UserMail>> GetUser(string user);

        Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid);

        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);

        Task<Result<long>> ResetDefaultAccountByUser(string user);

        Task<Result<long>> UpSertAccount(string user, Account accountIn);

        Task<Result<Account>> GetAccount(string user, string mail);

        Task<Result<bool>> ChangueState(string user, bool state);

        Task<Result<Account>> GetDefaultAccount(string user);
    }
}