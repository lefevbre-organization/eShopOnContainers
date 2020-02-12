namespace Account.API.Infrastructure.Services
{
    #region Using

    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    #endregion Using

    public interface IAccountsService
    {
        Task<Result<UserMail>> Create(UserMail account);

        Task<Result<UserMail>> GetUser(string user);

        Task<Result<bool>> ResetDefaultAccountByUser(string user);

        Task<Result<bool>> UpSertAccount(string user, Account accountIn);

        Task<Result<Account>> GetAccount(string user, string provider, string mail);

        Task<Result<Account>> GetDefaultAccount(string user);
        Task<Result<bool>> Remove(string user);

        Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail);

        Task<Result<bool>> ChangueState(string user, bool state);

        Task<Result<bool>> UpSertUserConfig(string user, ConfigUserLexon config);

        Task<Result<bool>> UpSertRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<bool>> RemoveRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid);

        Task<Result<bool>> UpSertAccountConfig(string user, string provider, string mail,  ConfigImapAccount config);
    }
}