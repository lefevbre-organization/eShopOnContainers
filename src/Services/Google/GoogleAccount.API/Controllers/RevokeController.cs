using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    
    [ApiController]
    [Route("api/v1/[controller]")]
    public class RevokeController : Controller
    {
        private readonly IRevokeService _service;
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IEventBus _eventBus;

        public RevokeController(
            IRevokeService revokeService,
            IOptions<GoogleAccountSettings> settings,
            IEventBus eventBus
            )
        {
            _service = revokeService ?? throw new ArgumentNullException(nameof(revokeService));
            this.settings = settings;
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


        /// <summary>
        /// Permite eliminar las credenciales del mongo, cuando se vuelva a llamar para utenticación no va a poder autenticar.
        /// </summary>
        /// <param name="LefebvreCredential"></param>
        /// <returns></returns>
        [HttpGet("Drive/Revoke")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<Result<bool>>> GetDrive([FromQuery] string LefebvreCredential)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La credencial es requerida.");

            var result = await _service.GetRevokingDriveCredentialAsync(LefebvreCredential);

            if (result.errors?.Count > 0 && result.data == false)
            {
                result.data = false;
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors?.Count == 0 && result.data == false)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        
    }
}