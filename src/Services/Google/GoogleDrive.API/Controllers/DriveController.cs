using Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Models;
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

namespace Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DriveController : ControllerBase
    {
        private IGoogleDriveService _service;
        private readonly IOptions<GoogleDriveSettings> _settings;
        internal readonly ILogger<DriveController> _log;

        public DriveController(
          IGoogleDriveService service
          , IOptions<GoogleDriveSettings> settings
            , ILogger<DriveController> log
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _log = log ?? throw new ArgumentNullException(nameof(log));
            //_log.LogError("Recibe llamada Google Drive"); // only for test
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
            var data = $"Google Drive v.{ _settings.Value.Version}";
            //_log.LogError(data);
            return Ok(new Result<string>(data));
        }


        
        [HttpGet("{idNavision}")]
        [ProducesResponseType(typeof(Result<UserGoogleDrive>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserGoogleDrive>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserAsync(
            [FromRoute] string idNavision = "E1621396",
            short idApp = 1)
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserGoogleDrive> result = await _service.GetUserAsync(idNavision, idApp);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("user")]
        [ProducesResponseType(typeof(Result<UserGoogleDrive>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserGoogleDrive>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUserAsync(
                [FromBody] UserGoogleDrive user
            )
        {
            if (string.IsNullOrEmpty(user.idNavision))
                return BadRequest("Must be a valid idUserNavision");

            Result<UserGoogleDrive> result = await _service.PostUserAsync(user);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }



    }
}