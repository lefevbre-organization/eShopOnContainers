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

    public class CalendarService : ICalendarService
    {
        public readonly ICalendarRepository _repository;
        private readonly IEventBus _eventBus;

        public CalendarService(
            ICalendarRepository repository,
            IEventBus eventBus)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        public async Task<Result<CalendarUser>> GetCalendarUser(string idNavision, string idNextCloud)
            => await _repository.GetCalendarUser(idNavision, idNextCloud);

        public async Task<Result<CalendarUser>> UpsertCalendarUser(CalendarUser calendarUser)
            => await _repository.UpsertCalendarUser(calendarUser);

        public async Task<Result<bool>> RemoveCalendarUser(string idNavisiom)
            => await _repository.RemoveCalendarUser(idNavisiom);

        public async Task<Result<Calendar>> AddCalendar(string idNavision, string idNextCloud, Calendar calendar)
         => await _repository.AddCalendar(idNavision, idNextCloud, calendar);

        public async Task<Result<bool>> RemoveCalendar(string idNavision, string idNextCloud, string idCalendar)
            => await _repository.RemoveCalendar(idNavision, idNextCloud, idCalendar);
    }
}