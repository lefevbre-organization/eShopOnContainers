using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Context;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using Newtonsoft.Json;
    using System.Net;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class ScopeController: Controller
    {

        private readonly IScopeService _service;
        private readonly GoogleAccountSettings _settings;
        private readonly IEventBus _eventBus;

        public ScopeController(
            IScopeService service,
            IOptionsSnapshot<GoogleAccountSettings> settings,
            IEventBus eventBus
            )
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _settings = settings.Value;
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<List<Scope>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<Scope>>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> GetAllForProduct([FromQuery] GoogleProduct product)
        {
            return Ok(await _service.GetScopes(product));
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<Scope>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Scope>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> CreateScope([FromBody] GoogleAccountScope scope)
        {
            return Ok(await _service.CreateScope(scope));
        }

        [HttpDelete("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> DeleteScope([FromQuery] string ScopeId)
        {
            return Ok(await _service.DeleteScope(ScopeId));
        }



    }
}
