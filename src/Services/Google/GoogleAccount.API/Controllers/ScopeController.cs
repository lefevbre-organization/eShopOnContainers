using System;
using System.Net;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
    using Model;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class ScopeController: Controller
    {

        private readonly IScopeService _service;

        public ScopeController(
            IScopeService service
            )
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<List<GoogleAccountScope>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<GoogleAccountScope>>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> GetAllForProduct([FromQuery] GoogleProduct? product)
        {

            if (product == null)
                return BadRequest("Debe tener un valor válido para Producto (0 Drive).");

            return Ok(await _service.GetScopes(product.Value));
        }

        [HttpPost]
        [Route("[action]")]
        [ProducesResponseType(typeof(Result<GoogleAccountScope>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<GoogleAccountScope>), (int)HttpStatusCode.BadRequest)]
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
