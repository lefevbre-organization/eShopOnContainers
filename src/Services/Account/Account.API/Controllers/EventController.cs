using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Account.API.Controllers
{
    #region Usings

    using Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;

    #endregion

    [Route("api/v2/eventypes")]
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


        [HttpGet()]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByAccount(
            [FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("email invalid. Must be a valid account to search the events");

            Result<AccountEvents> result = await _service.GetEventsByAccount(email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<AccountEvents>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser(
            [FromBody] AccountEvents accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.email))
                return BadRequest("email invalid.Must be a valid account to search the events");

            Result<AccountEvents> result = await _service.UpsertAccountEvents(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteUser(
            [FromBody] string email,
            [FromBody] string idEvent
            )
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(idEvent))
                return BadRequest("values invalid. Must be a valid email and idevent to delete the event");

            Result<bool> result = await _service.RemoveEvent(email, idEvent);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
