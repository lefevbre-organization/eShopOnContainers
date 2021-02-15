using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Controllers
{
    using Infrastructure.Services;
    using Models;

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
            _log.LogError("Recibe llamada Conference");
            System.Diagnostics.Trace.TraceError("Recibe llamada reportada momentaneamente como error para depurar");
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
            //_log.LogError(data);
            return Ok(new Result<string>(data));
        }

        [HttpPost("conference/js")]
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

        [HttpPost("conference")]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserReservation), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ConferenceCreateBodyAsync()
        {
            var reservation = new UserReservationRequest();
            using (var reader = new StreamReader(Request.Body))
            {
                var body = await reader.ReadToEndAsync();
                _log.LogError($"conference body: {body}");
                string[] parameters = body.Split('&');
                foreach (var pa in parameters)
                {
                    string[] param_values = pa.Split('=');

                    if (param_values.Length > 0 && param_values[0].Equals("name"))
                        reservation.name = param_values[1];
                    if (param_values.Length > 0 && param_values[0].Equals("mail_owner"))
                        reservation.name = param_values[1];
                    if (param_values.Length > 0 && param_values[0].Equals("start_time"))
                        reservation.name = param_values[1];
                    
                }
            }

            var result = await _service.CreateReservationAsync(reservation);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result.data);
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
            _log.LogError($"delete: {id}");

            var result = await _service.DeleteRoomAsync(id);

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

           // _log.LogError($"room: {name} con {idNavision}");

            var result = await _service.CreateRoomAsync(idNavision, name, idApp);

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

            var result = await _service.NotifyRoomAsync(idNavision, idApp, room);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/room/{name}/redirect")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateRoomRedirectAsync(
            [FromRoute] string name,
            [FromRoute] string idNavision = "E1621396",
            [FromQuery] short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            var result = await _service.CreateRoomAsync(idNavision, name, idApp);

            if (result.data.rooms?.ToList()?.Count <= 0 || result?.data?.rooms[0].url == null || result.errors.Count > 0)
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

            var result = await _service.SecureRoomAsync(idRoom, pass);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}")]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserConference>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserAsync(
            [FromRoute] string idNavision = "E1621396",
            short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            var result = await _service.GetUserAsync(idNavision, idApp);

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

            var result = await _service.PostUserAsync(user);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idNavision}/check")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CheckUserAsync(
            [FromRoute] string idNavision = "E1621396",
            short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            var result = await _service.CheckUserAsync(idNavision, idApp);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("conferences")]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<ConferenceSimple>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConferencesAsync()
        {
            var result = await _service.GetActiveConferencesAsync();

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