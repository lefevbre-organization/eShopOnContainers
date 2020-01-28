namespace Account.API.Infrastructure.Services
{
    #region Using

    using Account.API.Model;
    using System.Threading.Tasks;

    #endregion Using

    public interface IAccountsService
    {
        Task<Result<UserMail>> Create(UserMail account);

        Task<Result<AccountList>> GetByUser(string user);

        Task<Result<UserMail>> GetUser(string user);

        Task<Result<long>> UpdateDefaultAccount(string user, string provider, string email, string guid);

        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);

        Task<Result<long>> ResetDefaultAccountByUser(string user);

        Task<Result<long>> UpSertAccount(string user, Account accountIn);

        Task<Result<Account>> GetAccount(string user, string mail);

        Task<Result<Account>> GetDefaultAccount(string user);

        Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail);
        Task<Result<bool>> ChangueState(string user, bool state);
    }
}