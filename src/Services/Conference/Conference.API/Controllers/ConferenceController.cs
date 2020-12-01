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
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceCreateAsync(
        [FromBody] UserReservationRequest reservation
            )
        {
            if (string.IsNullOrEmpty(reservation.name))
                return BadRequest("Must be a valid name");

            var result = await _service.CreateReservationAsync(reservation);

            return result.errors.Count > 0 ? (IActionResult)BadRequest(result.data) : Ok(result.data);
        }

        [HttpPost("conference/qs")]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceCreateQSAsync(
            [FromQuery] string name,
            [FromQuery] string start_time,
            [FromQuery] string mail_owner
            )
        {
            var reservation = new UserReservationRequest() { mail_owner = mail_owner, name = name, start_time = start_time };
            //name=testroom1&start_time=2048-04-20T17%3A55%3A12.000Z&mail_owner=client1%40xmpp.com
            if (string.IsNullOrEmpty(reservation.name))
                return BadRequest("Must be a valid name");

            var result = await _service.CreateReservationAsync(reservation);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result.data) : Ok(result.data);
        }

        [HttpDelete("conference/{id}")]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceDeleteAsync(
         [FromRoute] string id
            )
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Must be a valid id");

            Result<int> result = await _service.DeleteRoomAsync(id);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idNavision}/room/{name}")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateRoomAsync(
            [FromRoute] string name,
            [FromRoute] string idNavision = "E1621396",
            [FromQuery] short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserConference> result = await _service.CreateRoomAsync(idNavision, name, idApp);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idNavision}/room/notify")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> NotifyRoomAsync(
            [FromBody] Room room,
            [FromRoute] string idNavision = "E1621396",
            [FromQuery] short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserRoom> result = await _service.NotifyRoomAsync(idNavision, idApp, room);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idNavision}/room/{name}/redirect")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateRoomRedirectAsync(
            [FromRoute] string name,
            [FromRoute] string idNavision = "E1621396",
            [FromQuery] short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserConference> result = await _service.CreateRoomAsync(idNavision, name, idApp);

            if (result.data.rooms?.ToList()?.Count > 0 || result?.data?.rooms[0].url == null || result.errors.Count > 0)
                return BadRequest(result);

            return Redirect(result.data.rooms[0].url);
        }

        [HttpPost("{idNavision}/room/{idRoom}/secure")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SecurizeRoomAsync(
            [FromQuery] string pass,
            [FromRoute] string idRoom)
        {
            if (string.IsNullOrEmpty(idRoom) && string.IsNullOrEmpty(pass))
                return BadRequest("Must be a valid room and pass");

            Result<UserRoom> result = await _service.SecureRoomAsync(idRoom, pass);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserAsync(
            [FromRoute]string idNavision = "E1621396",
            short idApp = 1)
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


        [HttpGet("conferences")]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConferencesAsync()
        {

            Result<List<ConferenceSimple>> result = await _service.GetActiveConferencesAsync();

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        //[HttpPost("{idNavision}/conferences/create")]
        //[ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        //[ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        //public async Task<IActionResult> ConferenceCreateAsync(
        //    [FromRoute] string idNavision = "E1621396",
        //    short idApp = 1
        //)
        //{
        //    //if (string.IsNullOrEmpty(conference.id))
        //    //    return BadRequest("Must be a valid id of coference");

        //    Result<ConferenceModel> result = await _service.CreateConferenceAsync(idNavision, idApp, null);

        //    return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        //}

        //[HttpPost("{idNavision}/conferences/create/advance")]
        //[ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        //[ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        //public async Task<IActionResult> ConferenceCreateAdvanceAsync(
        //    [FromBody] ConferenceModel conference,
        //    [FromRoute] string idNavision = "E1621396",
        //    short idApp = 1
        //    )
        //{
        //    //if (string.IsNullOrEmpty(conference.id))
        //    //    return BadRequest("Must be a valid id of coference");

        //    Result<ConferenceModel> result = await _service.CreateConferenceAsync(idNavision, idApp, conference);

        //    return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        //}

        [HttpGet("{idNavision}/conferences/get/{id}")]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConferenceByIdAsync(
            [FromRoute] string idNavision = "E1621396",
            [FromRoute] string id = "1",
            short idApp = 1
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
            short idApp = 1
        )
        {
            if (string.IsNullOrEmpty(conference.id))
                return BadRequest("Must be a valid id of coference");

            Result<ConferenceModel> result = await _service.CreateConferenceAsync(idNavision, idApp, conference);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/conferences/stats")]
        [ProducesResponseType(typeof(Result<ConferenceStats>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ConferenceStats>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetStatsConferenceByIdAsync(
            [FromRoute] string idNavision = "E1621396",
            short idApp = 1
            )
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<ConferenceStats> result = await _service.GetStatsConferenceByIdAsync(idNavision, idApp, null);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }


    }
}
