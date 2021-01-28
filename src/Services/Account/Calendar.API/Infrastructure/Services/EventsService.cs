namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Services
{
    #region Using

    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Repositories;
    using System;
    using System.Threading.Tasks;

    #endregion Using

    public class EventsService : IEventsService
    {
        public readonly IEventsRepository _repository;
        private readonly IEventBus _eventBus;

        public EventsService(
            IEventsRepository repository,
            IEventBus eventBus)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        public async Task<Result<AccountEventTypes>> GetEventsByAccount(string account)
            => await _repository.GetEventTypesByAccount(account);

        public async Task<Result<AccountEventTypes>> UpsertAccountEvents(AccountEventTypes accountIn)
            => await _repository.UpsertAccountEventTypes(accountIn);

        public async Task<Result<bool>> RemoveEvent(string email, string idEvent)
            => await _repository.RemoveEventType(email, idEvent);

        public async Task<Result<EventType>> AddEvent(string email, EventType eventType)
         => await _repository.AddEventType(email, eventType);

        public async Task<Result<bool>> RemoveAccountEvent(string email)
            => await _repository.RemoveAccountEventType(email);
    }
}