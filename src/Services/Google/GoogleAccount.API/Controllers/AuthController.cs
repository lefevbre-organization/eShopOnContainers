using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Context;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using Newtonsoft.Json;
    using System.Net;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        private readonly IGoogleAuthService _service;
        private readonly GoogleAccountSettings _settings;
        private readonly IEventBus _eventBus;

        public AuthController(
            IGoogleAuthService authsService,
            IOptionsSnapshot<GoogleAccountSettings> settings,
            IEventBus eventBus,
            ApplicationDbContext context, 
            IConfiguration configuration
            )
        {
            _service = authsService ?? throw new ArgumentNullException(nameof(authsService));
            _settings = settings.Value;
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            this.context = context;
            this.configuration = configuration;
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
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> GetDrive([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope, [FromQuery] string error = "")
        {

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);

            var result = await _service.SaveCode(state, code);

            if (result.errors.Count == 0 && result.data == null)
                return BadRequest(result);

            return Redirect(configuration["InternalRedirection"]);
        }

    }
}