using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{
    using System;
    using System.Net;
    using Context;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;

    [ApiController]
    [Route("api/v1/Credential")]
    public class RevokeController : Controller
    {
        private readonly IRevokeService _service;
        private readonly GoogleAccountSettings _settings;
        private readonly IEventBus _eventBus;

        public RevokeController(
            IRevokeService revokeService,
            IOptionsSnapshot<GoogleAccountSettings> settings,
            IEventBus eventBus
            )
        {
            _service = revokeService ?? throw new ArgumentNullException(nameof(revokeService));
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


        /// <summary>
        /// Permite eliminar las credenciales del mongo, cuando se vuelva a llamar para utenticación no va a poder autenticar.
        /// </summary>
        /// <param name="LefebvreCredential"></param>
        /// <returns></returns>
        [HttpGet("{LefebvreCredential}/Drive/Revoke")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<Result<bool>>> GetDrive(string LefebvreCredential)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest();

            var result = await _service.GetRevokingCredentialAsync(LefebvreCredential);

            if (result.errors.Count == 0 && result.data == false)
                return BadRequest(result);

            return Ok(result);
        }

        
    }
}