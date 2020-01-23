namespace Account.API.Infrastructure.Repositories
{
    #region Using

    using Model;
    using System.Threading.Tasks;
    using IntegrationEvents.Events;

    #endregion

    public interface IAccountsRepository
    {
        //Task<Result<AccountList>> Get();
        //Task<Result<UserMail>> Get(string id);
        Task<Result<UserMail>> Create(UserMail account);
        Task<Result<long>> Remove(string id);
        //Task<Result<long>> Update(string id, UserMail accountIn);
        Task<Result<AccountList>> GetByUser(string user);
        Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid);
        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);
        Task<Result<long>> ResetDefaultAccountByUser(string user);

        //Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation);
        Task<Result<long>> UpSertAccount(string user, Account accountIn);
    }
}