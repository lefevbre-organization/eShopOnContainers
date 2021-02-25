namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Repositories
{
    
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
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