namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Repositories
{
    #region Using

    using Model;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using IntegrationEvents.Events;

    #endregion

    public interface IAccountsRepository
    {
        Task<Result<AccountList>> Get();
        Task<Result<MailAccount>> Get(string id);
        Task<Result<MailAccount>> Create(MailAccount account);
        Task<Result<long>> Remove(string id);
        Task<Result<long>> Update(string id, MailAccount accountIn);
        Task<Result<AccountList>> GetByUser(string user);
        Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider = null);
        Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);
        Task<Result<long>> ResetDefaultAccountByUser(string user);

        Task<long> AddOperationAsync(string user, string provider, string mail, bool defaultAccount, EnTypeOperation typeOperation);
    }
}