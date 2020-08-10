using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

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

    #endregion

    [Route("api/v2/events")]
    [ApiController]
    public class EventController : Controller
    {
        private readonly IAccountsService _service;
        private readonly AccountSettings _settings;
        private readonly IEventBus _eventBus;

        public EventController(
            IAccountsService accountsService,
            IOptionsSnapshot<AccountSettings> settings,
            IEventBus eventBus)
        {
            _service = accountsService ?? throw new ArgumentNullException(nameof(accountsService));
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
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByAccount(
            [FromBody] AccountEventRequest accountIn)
        {
            if (string.IsNullOrEmpty(accountIn.Email))
                return BadRequest("email invalid. Must be a valid account to search the events");

            Result<AccountEvents> result = await _service.GetEventsByAccount(accountIn.Email);

            if (result.errors.Count == 0 && result.data == null)
                return NotFound(result);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("post")]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostAccount(
            [FromBody] AccountEvents accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.email))
                return BadRequest("email invalid.Must be a valid account to search the events");

            Result<AccountEvents> result = await _service.UpsertAccountEvents(accountIn);

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
            [FromBody] AccountEventRequestAdd accountIn
        )
        {
            if (string.IsNullOrEmpty(accountIn.Email) || accountIn.eventType == null)
                return BadRequest("values invalid. Must be a valid email and idevent to delete the event");

            Result<EventType> result = await _service.AddEvent(accountIn.Email, accountIn.eventType);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
