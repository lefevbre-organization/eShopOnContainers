using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Controllers
{
    using Infrastructure.Services;
    using Model;

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

        
    }
}