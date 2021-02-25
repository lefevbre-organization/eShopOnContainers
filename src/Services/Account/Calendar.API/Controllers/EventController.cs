using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Controllers
{


    using ViewModel;
    using Infrastructure.Services;
    using Model;


    [Route("api/v2/events")]
    [ApiController]
    public class EventController : Controller
    {
        private readonly IEventsService _service;
        private readonly CalendarSettings _settings;
        private readonly IEventBus _eventBus;

        public EventController(
            IEventsService service,
            IOptionsSnapshot<CalendarSettings> settings,
            IEventBus eventBus)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _settings = settings.Value;
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"Calendar.Api -> Events v.{ _settings.Version}";
            return Ok(new Result<string>(data));
        }

        [HttpPost("get")]
        [ProducesResponseType(typeof(Result<AccountEventTypes>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(Result<AccountEventTypes>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByAccount(
            [FromBody] AccountEventRequest accountIn)
        {
            if (string.IsNullOrEmpty(accountIn.Email))
                return BadRequest("email invalid. Must be a valid account to search the events");

            Result<AccountEventTypes> result = await _service.GetEventsByAccount(accountIn.Email);

            if (result.errors.Count == 0 && result.data == null)
                return NotFound(result);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("post")]
        [ProducesResponseType(typeof(Result<AccountEventTypes>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<AccountEventTypes>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostAccount(
            [FromBody] AccountEventTypes accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.email))
                return BadRequest("email invalid.Must be a valid account to search the events");

            Result<AccountEventTypes> result = await _service.UpsertAccountEvents(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpDelete()]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteAccountEvent(
            [FromBody] string email
    )
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("values invalid. Must be a valid email to delete");

            Result<bool> result = await _service.RemoveAccountEvent(email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("eventtype/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteAccountEvent(
            [FromBody] AccountEventElementRequest accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.Email) || string.IsNullOrEmpty(accountIn.IdEvent))
                return BadRequest("values invalid. Must be a valid email and idevent to delete the event");

            Result<bool> result = await _service.RemoveEvent(accountIn.Email, accountIn.IdEvent);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("eventtype/add")]
        [ProducesResponseType(typeof(Result<EventType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<EventType>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddAccountEvent(
            [FromBody] AccountEventAddRequest accountIn
        )
        {
            if (string.IsNullOrEmpty(accountIn.Email) || accountIn.eventType == null)
                return BadRequest("values invalid. Must be a valid email and idevent to delete the event");

            Result<EventType> result = await _service.AddEvent(accountIn.Email, accountIn.eventType);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}