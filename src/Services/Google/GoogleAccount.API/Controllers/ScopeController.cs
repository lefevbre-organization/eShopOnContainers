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
        public async Task<ActionResult> GetAllForProduct([FromQuery] GoogleProduct? product)
        {

            if (product == null)
                return BadRequest("Debe tener un valor válido para Producto (0 Drive).");

            return Ok(await _service.GetScopes(product.Value));
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<Scope>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Scope>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> CreateScope([FromBody] GoogleAccountScope scope)
        {
            if (scope == null)
                return BadRequest("Necesita ingresar un modelo válido");

            if (string.IsNullOrEmpty(scope.Url))
                return BadRequest("Un Scope necesita como mínimo una url válida");

            return Ok(await _service.CreateScope(scope));
        }

        [HttpDelete("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> DeleteScope([FromQuery] string ScopeId)
        {

            if (string.IsNullOrEmpty(ScopeId))
                return BadRequest("Necesita un Id válido para eliminar su Scope");

            return Ok(await _service.DeleteScope(ScopeId));
        }



    }
}
