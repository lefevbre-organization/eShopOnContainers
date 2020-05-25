using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SignaturitController : ControllerBase
    {
        private IUserUtilsService _service;
        private readonly IOptions<UserUtilsSettings> _settings;

        public SignaturitController(
          IUserUtilsService service
          , IOptions<UserUtilsSettings> settings
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Permite obtener los token necesarios mediante login y password y eligiendo la aplicación adecuada
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequestLogin tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password))
                return BadRequest("Must be a valid login and password");

            Result<TokenData> result = await _service.GetUserFromLoginAsync(
                tokenRequest.idApp, tokenRequest.login, tokenRequest.password, addTerminatorToToken);

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/id")]
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
    }
}