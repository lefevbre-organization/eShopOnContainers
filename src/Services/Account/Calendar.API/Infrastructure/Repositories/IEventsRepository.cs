namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Repositories
{
    
    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Threading.Tasks;
    
    public interface IEventsRepository
    {
        Task<Result<AccountEventTypes>> GetEventTypesByAccount(string account);
        Task<Result<AccountEventTypes>> UpsertAccountEventTypes(AccountEventTypes accountIn);
        Task<Result<bool>> RemoveEventType(string email, string idEvent);
        Task<Result<EventType>> AddEventType(string email, EventType eventType);
        Task<Result<bool>> RemoveAccountEventType(string email);
    }
}