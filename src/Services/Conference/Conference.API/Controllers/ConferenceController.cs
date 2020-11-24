using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ConferenceController : ControllerBase
    {
        private IConferenceService _service;
        private readonly IOptions<ConferenceSettings> _settings;
        internal readonly ILogger<ConferenceController> _log;

        public ConferenceController(
          IConferenceService service
          , IOptions<ConferenceSettings> settings
            , ILogger<ConferenceController> log
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _log = log ?? throw new ArgumentNullException(nameof(log));
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
            var data = $"Conference v.{ _settings.Value.Version}";
            System.Diagnostics.Trace.WriteLine(data);
            _log.LogDebug(data);
            return Ok(new Result<string>(data));
        }

        [HttpPost("conference")]
        [ProducesResponseType(typeof(Result<UserReservation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserReservation>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUserAsync(
        [FromBody] UserReservationRequest reservation
    )
        {
            if (string.IsNullOrEmpty(reservation.name))
                return BadRequest("Must be a valid name");

            Result<UserReservation> result = await _service.CreateReservationAsync(reservation);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/user")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserAsync(
            [FromRoute]string idNavision = "E1621396",
            int idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserConference> result = await _service.GetUserAsync(idNavision, idApp);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("user")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUserAsync(
                [FromBody] UserConference user 
            )
        {
            if (string.IsNullOrEmpty(user.idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserConference> result = await _service.PostUserAsync(user);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpGet("{idNavision}/conferences")]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConferencesAsync(
            [FromRoute] string idNavision = "E1621396",
            int idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<List<ConferenceSimple>> result = await _service.GetConferencesAsync(idNavision, idApp);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idNavision}/conferences/create")]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceCreateAsync(
            [FromBody] ConferenceModel conference,
            [FromRoute] string idNavision = "E1621396",
            int idApp = 1
        )
        {
            if (string.IsNullOrEmpty(conference.id))
                return BadRequest("Must be a valid id of coference");

            Result<ConferenceModel> result = await _service.CreateConferenceAsync(idNavision, idApp, conference);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/conferences/get/{id}")]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConferenceByIdAsync(
            [FromRoute] string idNavision = "E1621396",
            [FromRoute] string id = "1",
            int idApp = 1
            )
        {
            if (string.IsNullOrEmpty(idNavision) || string.IsNullOrEmpty(id))
                return BadRequest("Must be a valid idUserNavision  and id of conference");

            Result<ConferenceModel> result = await _service.GetConferenceByIdAsync(idNavision, idApp, id);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPatch("{idNavision}/conferences/update")]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceUpdateAsync(
            [FromBody] ConferenceModel conference,
            [FromRoute] string idNavision = "E1621396",
            int idApp = 1
        )
        {
            if (string.IsNullOrEmpty(conference.id))
                return BadRequest("Must be a valid id of coference");

            Result<ConferenceModel> result = await _service.CreateConferenceAsync(idNavision, idApp, conference);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/conferences/stats/{id}")]
        [ProducesResponseType(typeof(Result<ConferenceStats>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceStats>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetStatsConferenceByIdAsync(
            [FromRoute] string idNavision = "E1621396",
            [FromRoute] string id = "1",
            int idApp = 1
            )
        {
            if (string.IsNullOrEmpty(idNavision) || string.IsNullOrEmpty(id))
                return BadRequest("Must be a valid idUserNavision  and id of conference");

            Result<ConferenceStats> result = await _service.GetStatsConferenceByIdAsync(idNavision, idApp, id);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }


    }
}
