using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using UserUtils.API.Models;
using UserUtils.API.Infrastructure.Services;

namespace UserUtils.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class UserUtilsController : ControllerBase
    {
        private IUserUtilsService _service;
        private readonly IOptions<UserUtilsSettings> _settings;

        public UserUtilsController(
          IUserUtilsService service
          , IOptions<UserUtilsSettings> settings
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
             string idClienteNavision = "E1621396"
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(idClienteNavision))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            var token = new TokenModelBase() { idClienteNavision = idClienteNavision };

            var result = await _service.GetTokenAsync(token, addTerminatorToToken);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);

        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/validation")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenValidationAsync(
             [FromBody] string token
            )
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("Must be a valid token to validate");

            var tokenRequest = new TokenData() { token = token, valid = false };
            var result = await _service.VadidateTokenAsync(tokenRequest);
            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPost("token"), Consumes("application/json", "application/xml", "application/x-www-form-urlencoded", "multipart/form-data", "text/plain; charset=utf-8", "text/html")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenPostAsync(
              [FromForm] string login
             , [FromForm] string password
             , [FromForm] bool addTerminatorToToken = true
            )
        {
            var tokenRequest = new TokenModelBase
            {
                login = login,
                password = password
            };
            if (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            var result = await _service.GetTokenAsync(tokenRequest, addTerminatorToToken);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpGet("user/apps")]
        [ProducesResponseType(typeof(Result<List<LexApp>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<LexApp>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserAppsAsync(string idNavisionUser = "E1621396", bool onlyActives = true)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _service.GetUserUtilsAsync(idNavisionUser, onlyActives);
            return Ok(result);
        }

        [HttpGet("user/encode")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEncodeAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid iduser to encode");

            var result = await _service.GetEncodeUserAsync(idNavisionUser);
            return Ok(result);
        }

        [HttpGet("user/decode")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDecodeAsync(string idEncodedNavisionUser = "eHZqcHllZQ%3D%3D")
        {
            if (string.IsNullOrEmpty(idEncodedNavisionUser))
                return (IActionResult)BadRequest("id encoded value invalid. Must be a valid encoded user");

            var result = await _service.GetDecodeUserAsync(idEncodedNavisionUser);
            return Ok(result);
        }
    }
}
