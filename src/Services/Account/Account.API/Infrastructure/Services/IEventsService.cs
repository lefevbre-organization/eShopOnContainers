namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Services
{
    #region Using

    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Threading.Tasks;
    #endregion

    public interface IEventsService
    {
        Task<Result<AccountEventTypes>> GetEventsByAccount(string account);
        Task<Result<AccountEventTypes>> UpsertAccountEvents(AccountEventTypes accountIn);
        Task<Result<bool>> RemoveAccountEvent(string email);
        Task<Result<bool>> RemoveEvent(string email, string idEvent);
        Task<Result<EventType>> AddEvent(string email, EventType eventType);
    }
}