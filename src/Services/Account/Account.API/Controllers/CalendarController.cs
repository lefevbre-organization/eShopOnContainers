namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Controllers
{
    #region Usings

    using Account.API.ViewModel;
    using Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using System;
    using System.Net;
    using System.Threading.Tasks;

    #endregion Usings

    [Route("api/v2/calendar")]
    [ApiController]
    public class CalendarController : Controller
    {
        private readonly ICalendarService _service;
        private readonly AccountSettings _settings;
        private readonly IEventBus _eventBus;

        public CalendarController(
            ICalendarService calendarService,
            IOptionsSnapshot<AccountSettings> settings,
            IEventBus eventBus)
        {
            _service = calendarService ?? throw new ArgumentNullException(nameof(calendarService));
            _settings = settings.Value;
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
        }

        [HttpPost("get")]
        [ProducesResponseType(typeof(Result<CalendarUser>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(Result<CalendarUser>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCalendarUser(
            [FromBody] CalendarUserRequest calendarUser)
        {
            if (string.IsNullOrEmpty(calendarUser.idNavision) && string.IsNullOrEmpty(calendarUser.idNextCloud))
                return BadRequest("Must be a valid idNavision or idNextCloud to search the events");

            Result<CalendarUser> result = await _service.GetCalendarUser(calendarUser.idNavision, calendarUser.idNextCloud);

            if (result.errors.Count == 0 && result.data == null)
                return NotFound(result);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("post")]
        [ProducesResponseType(typeof(Result<CalendarUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CalendarUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostCalendarUser(
            [FromBody] CalendarUser calendarUser
            )
        {
            if (string.IsNullOrEmpty(calendarUser.idNavision))
                return BadRequest("Must be a valid idNavision to post calendar user");

            Result<CalendarUser> result = await _service.UpsertCalendarUser(calendarUser);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteCalendarUser(
            [FromBody] string idNavision
            )
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("values invalid. Must be a valid idNavision to rmove CalendarUser");

            Result<bool> result = await _service.RemoveCalendarUser(idNavision);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("calendar/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteCalendar(
            [FromBody] CalendarRequest calendar
            )
        {
            if ((string.IsNullOrEmpty(calendar.idNavision) && string.IsNullOrEmpty(calendar.idNextCloud)) || string.IsNullOrEmpty(calendar.IdCalendar))
                return BadRequest("values invalid. Must be a valid idnavision and idCalendar to delete the event");

            Result<bool> result = await _service.RemoveCalendar(calendar.idNavision, calendar.idNextCloud, calendar.IdCalendar);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("calendar/add")]
        [ProducesResponseType(typeof(Result<Calendar>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Calendar>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddAccountEvent(
            [FromBody] CalendarAddRequest calendarAdd
        )
        {
            if ((string.IsNullOrEmpty(calendarAdd.idNavision) && string.IsNullOrEmpty(calendarAdd.idNextCloud)) || calendarAdd.calendar == null)
                return BadRequest("values invalid. Must be a valid email and idevent to delete the event");

            Result<Calendar> result = await _service.AddCalendar(calendarAdd.idNavision, calendarAdd.idNextCloud, calendarAdd.calendar);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}