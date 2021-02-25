﻿using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CentinelaController : ControllerBase
    {
        private IUserUtilsService _service;
        private readonly IOptions<UserUtilsSettings> _settings;

        public CentinelaController(
          IUserUtilsService service
          , IOptions<UserUtilsSettings> settings
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"UserUtils.Centinela v.{ _settings.Value.Version} - DefaultEnv:{_settings.Value.DefaultEnvironment}";
            return Ok(new Result<string>(data));
        }


        /// <summary>
        /// Permite obtener los token mandando id por querystring
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/mail")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
             string idClienteNavision = "E1621396"
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(idClienteNavision))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var token = new TokenRequest() { idClienteNavision = idClienteNavision, idApp = _settings.Value.IdAppCentinela };

            var result = await _service.GetGenericTokenAsync(token, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Centinela", message = "token/mail" });
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios mediante login y password y eligiendo la aplicación adecuada
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/firm/new")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenFirmNewAsync(
            [FromBody] TokenRequestCentinelaNewFirm tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (tokenRequest.idApp == null || tokenRequest.idApp != _settings.Value.IdAppCentinela)
                tokenRequest.idApp = _settings.Value.IdAppCentinela;

            if ( tokenRequest.documentsId?.Count == 0 || tokenRequest.recipientsId?.Count == 0)
                return BadRequest("Must be a valid list of documents and recipients");

            Result<TokenData> result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Centinela", message = "token/firm/new" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
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
             [FromBody] string token,
             [FromQuery] bool validateCaducity = true 
            )
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("Must be a valid token to validate");

            var tokenRequest = new TokenData() { token = token, valid = false };
            var result = await _service.VadidateTokenAsync(tokenRequest, validateCaducity);
            result.infos.Add(new Info() { code = "UserUtils.Centinela", message = "token/validation" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }
    }
}