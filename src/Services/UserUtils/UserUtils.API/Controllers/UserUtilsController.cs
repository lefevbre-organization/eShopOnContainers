using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using UserUtils.API.Infrastructure.Services;
using UserUtils.API.Models;

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

        [HttpGet("user/apps")]
        [ProducesResponseType(typeof(Result<List<LexApp>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<LexApp>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserAppsAsync(string idNavisionUser = "E1621396", bool onlyActives = true)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _service.GetUserUtilsAsync(idNavisionUser, onlyActives);
            result.infos.Add(new Info() { code = "0000", message = "estoy en user utils" });
            return Ok(result);
        }

        [HttpPut("user/areas")]
        [ProducesResponseType(typeof(Result<ServiceComArea[]>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComArea[]>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAreasByUserAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            Result<ServiceComArea[]> result = await _service.GetAreasByUserAsync(idNavisionUser);
            return Ok(result);
            //http://led-servicecomtools/Areas/GetUsuariosProAreas?idUsuarioPro=E0384919
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
            //http://led-servicecomtools/Login/RecuperarUsuario?login=e0384919&password=asasd
        }

        [HttpPut("user/get/login")]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserWithLoginAsync(
            string login = "i.molina-ext@lefebvreelderecho.com"
            , string pass = "imolina2"
            )
        {
            if (string.IsNullOrEmpty(login))
                return (IActionResult)BadRequest("id encoded value invalid. Must be a valid encoded user");

            Result<ServiceComUser> result = await _service.GetUserDataWithLoginAsync(login, pass);
            return Ok(result);
            //Http://led-servicecomtools/Login/RecuperarUsuario?strLogin=f.reyes-ext@lefebvreelderecho.com&strPass=etEb9221
        }

        [HttpPut("user/get/entrada")]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserWithEntradaAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id encoded value invalid. Must be a valid encoded user");

            Result<ServiceComUser> result = await _service.GetUserDataWithEntryAsync(idNavisionUser);
            return Ok(result);
            //http://led-servicecomtools/Login/RecuperarUsuarioPorEntrada?idUsuarioPro=E1621396
        }

        /// <summary>
        /// Permite agregar una dirección de reemplazo para redirigir la petición del minihub
        /// </summary>
        /// <returns></returns>
        [HttpPost("user/apps/bypass")]
        [ProducesResponseType(typeof(Result<ByPassModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ByPassModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ByPastPostAsync(
              [FromBody] ByPassModel byPass
            )
        {
            if (string.IsNullOrEmpty(byPass.NameService) && string.IsNullOrEmpty(byPass.UrlByPass))
                return BadRequest("value invalid. Must be a valid NameService and valid url to redirect");

            Result<ByPassModel> result = await _service.PostByPassAsync(byPass);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite obtener una dirección de reemplazo para redirigir la petición del minihub
        /// </summary>
        /// <returns></returns>
        [HttpGet("user/apps/bypass")]
        [ProducesResponseType(typeof(Result<ByPassModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ByPassModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ByPassGetAsync(
              [FromQuery] string NameService
            )
        {
            if (string.IsNullOrEmpty(NameService))
                return BadRequest("value invalid. Must be a valid NameService");

            Result<ByPassModel> result = await _service.GetByPassAsync(NameService);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }


        /// <summary>
        /// Permite borrar una dirección de reemplazo para redirigir la petición del minihub
        /// </summary>
        /// <returns></returns>
        [HttpPost("user/apps/bypass/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ByPassRemoveAsync(
              [FromBody] ByPassModel byPass
            )
        {
            if (string.IsNullOrEmpty(byPass.NameService) && string.IsNullOrEmpty(byPass.UrlByPass))
                return BadRequest("value invalid. Must be a valid NameService and valid url to redirect");

            Result<bool> result = await _service.RemoveByPassAsync(byPass);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Devueve una redirección hacia una url
        /// </summary>
        /// <returns></returns>
        [HttpGet("user/apps/redirect")]
        [ProducesResponseType(typeof(RedirectResult), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(RedirectResult), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ByPassUrlAsync(
              [FromQuery] string NameService, 
              [FromQuery] string idUser
            )
        {
            Result<ByPassModel> result = await _service.GetByPassAsync(NameService);
            Result<string> resultUserUtils = await _service.GetUserUtilsActualToServiceAsync(idUser, NameService);

            return Redirect(resultUserUtils.data);
         
        }


    }


}