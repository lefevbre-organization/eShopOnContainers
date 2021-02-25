using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Model;

    public interface IEventsService
    {
        Task<Result<AccountEventTypes>> GetEventsByAccount(string account);
        Task<Result<AccountEventTypes>> UpsertAccountEvents(AccountEventTypes accountIn);
        Task<Result<bool>> RemoveAccountEvent(string email);
        Task<Result<bool>> RemoveEvent(string email, string idEvent);
        Task<Result<EventType>> AddEvent(string email, EventType eventType);
    }
}