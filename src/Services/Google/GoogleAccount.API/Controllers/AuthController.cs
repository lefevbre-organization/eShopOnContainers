using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{
  
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using Model;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : Controller
    {
        
        private readonly IAuthService _service;
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IEventBus _eventBus;

        public AuthController(
            IAuthService authsService,
            IOptions<GoogleAccountSettings> settings,
            IEventBus eventBus
            )
        {
            _service = authsService ?? throw new ArgumentNullException(nameof(authsService));
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


        [HttpGet("Drive/Success")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> GetDriveSuccess([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope, [FromQuery] string error = "")
        {
            if (string.IsNullOrEmpty(code) && string.IsNullOrEmpty(error))
                return BadRequest("email invalid. Must be a valid code or a valid error");

            var result = await _service.Success(GoogleProduct.Drive, state, code, scope, error);

            if (result.errors?.Count > 0)
                return BadRequest(result);

            return Redirect(settings.Value.InternalRedirection);
        }

    }
}