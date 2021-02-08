using System;
using System.Net;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using Model;
    using Microsoft.Extensions.Logging;
    using Microsoft.AspNetCore.Http;

    [Route("api/v1/[controller]")]
    [ApiController]
    public class ScopeController: ControllerBase
    {

        private readonly IScopeService _service;
        internal readonly ILogger<ScopeController> _log;


        public ScopeController(
            IScopeService service
            , ILogger<ScopeController> log

            )
        {
            _log = log ?? throw new ArgumentNullException(nameof(log));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
        }

        [HttpGet("/{product}")]
        [ProducesResponseType(typeof(Result<List<GoogleAccountScope>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<GoogleAccountScope>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAllForProduct([FromRoute] GoogleProduct product = GoogleProduct.Drive  )
        {

            //if (product == null)
            //    return BadRequest("Debe tener un valor válido para Producto (0 Drive).");

            //return Ok(await _service.GetScopes(product));
            var result = await _service.GetScopes(product);
            if (result.errors?.Count > 0 && result.data == null)
            {
                result.data = null;
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors?.Count == 0 && result.data.Count == 0)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<GoogleAccountScope>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<GoogleAccountScope>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateScope(
            [FromBody] GoogleAccountScope scope)
        {
            if (scope == null)
                return BadRequest("Necesita ingresar un modelo válido");

            if (string.IsNullOrEmpty(scope.Url))
                return BadRequest("Un Scope necesita como mínimo una url válida");

            var result = await _service.CreateScope(scope);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        
        }

        [HttpDelete]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteScope([FromQuery] string ScopeId)
        {

            if (string.IsNullOrEmpty(ScopeId))
                return BadRequest("Necesita un Id válido para eliminar su Scope");

            //return Ok(await _service.DeleteScope(ScopeId));
            var result = await _service.DeleteScope(ScopeId);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }



    }
}
