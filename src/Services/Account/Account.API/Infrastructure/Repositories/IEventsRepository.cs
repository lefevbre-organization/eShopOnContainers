namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Repositories
{
    #region using
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Threading.Tasks;
    #endregion
    public interface IEventsRepository
    {
        Task<Result<AccountEventTypes>> GetEventTypesByAccount(string account);
        Task<Result<AccountEventTypes>> UpsertAccountEventTypes(AccountEventTypes accountIn);
        Task<Result<bool>> RemoveEventType(string email, string idEvent);
        Task<Result<EventType>> AddEventType(string email, EventType eventType);
        Task<Result<bool>> RemoveAccountEventType(string email);
    }
}