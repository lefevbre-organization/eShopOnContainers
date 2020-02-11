namespace Account.API.Infrastructure.Repositories
{
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IAccountsRepository
    {
        Task<Result<UserMail>> Create(UserMail account);

        //Task<Result<UpdateResult>> AddUser(string user);

        //Task<Result<AccountList>> GetByUser(string user);

        Task<Result<UserMail>> GetUser(string user);

        //Task<Result<long>> UpdateDefaultAccount(string user, string email, string provider, string guid);

        //Task<Result<long>> DeleteAccountByUserAndEmail(string user, string email);
        //Task<Result<long>> DeleteAccountByUser(string user);

        Task<Result<long>> ResetDefaultAccountByUser(string user);

        Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail);

        Task<Result<long>> UpSertAccount(string user, Account accountIn);

        Task<Result<Account>> GetAccount(string user, string provider, string mail);

        Task<Result<bool>> ChangueState(string user, bool state);

        Task<Result<Account>> GetDefaultAccount(string user);

        Task<Result<bool>> UpSertConfig(string user, ConfigUserLexon config);

        Task<Result<bool>> UpSertRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<bool>> RemoveRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid);

        Task<Result<bool>> UpSertAccountConfig(string user, string provider, string mail, ConfigImapAccount config);
        Task<Result<long>> Remove(string user);
    }
}