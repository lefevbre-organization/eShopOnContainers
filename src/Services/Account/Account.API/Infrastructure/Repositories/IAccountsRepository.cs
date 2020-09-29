namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Repositories
{
    #region using
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    #endregion
    public interface IAccountsRepository
    {
        Task<Result<UserMail>> Create(UserMail account);

        Task<Result<UserMail>> GetUser(string user);

        Task<Result<bool>> ResetDefaultAccountByUser(string user);

        Task<Result<UserMail>> RemoveAccount(string user, string provider, string mail);

        Task<Result<bool>> UpSertAccount(string user, Account accountIn);

        Task<Result<Account>> GetAccount(string user, string provider, string mail);

        Task<Result<bool>> ChangueState(string user, bool state);

        Task<Result<Account>> GetDefaultAccount(string user);

        Task<Result<bool>> UpSertConfig(string user, ConfigUserLexon config);

        Task<Result<bool>> UpSertRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<bool>> RemoveRelationMail(string user, string provider, string mail, MailRelation relation);

        Task<Result<List<MailRelation>>> GetRelationsFromMail(string user, string provider, string mail, string uid);

        Task<Result<bool>> UpSertAccountConfig(string user, string provider, string mail, ConfigImapAccount config);

        Task<Result<bool>> Remove(string user);
        Task<Result<RawMessageProvider>> GetRawUser(string user, string provider, string account, string messageId);
        Task<Result<RawMessageProvider>> CreateRaw(RawMessageProvider rawMessage);
        Task<Result<bool>> DeleteRaw(RawMessageProvider rawMessage);
        Task<Result<AccountEventTypes>> GetEventTypesByAccount(string account);
        Task<Result<AccountEventTypes>> UpsertAccountEventTypes(AccountEventTypes accountIn);
        Task<Result<bool>> RemoveEventType(string email, string idEvent);
        Task<Result<EventType>> AddEventType(string email, EventType eventType);
        Task<Result<bool>> RemoveAccountEventType(string email);
    }
}