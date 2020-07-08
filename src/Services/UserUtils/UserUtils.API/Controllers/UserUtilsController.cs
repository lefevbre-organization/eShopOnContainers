using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Controllers
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
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"UserUtils.Utils v.{ _settings.Value.Version} - DefaultEnv:{_settings.Value.DefaultEnvironment}";
            return Ok(new Result<string>(data));
        }

        #region Token

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
             , [FromForm] short idApp
             , [FromForm] bool addTerminatorToToken = true
            )
        {
            var tokenRequest = new TokenRequestLogin
            {
                login = login,
                password = password,
                idApp = idApp
            };
            if (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            var result = await _service.GetGenericTokenAsync((TokenRequest)tokenRequest, addTerminatorToToken);

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

        #endregion Token

        #region User

        [HttpGet("user/apps")]
        [ProducesResponseType(typeof(Result<List<LefebvreApp>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<LefebvreApp>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserAppsAsync(string idNavisionUser = "E1621396", bool onlyActives = true)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _service.GetUserUtilsAsync(idNavisionUser, onlyActives);
            result.infos.Add(new Info() { code = "UserUtilsCheck", message = "estoy en user utils" });
            return Ok(result);
        }

        [HttpGet("user/areas")]
        [ProducesResponseType(typeof(Result<ServiceComArea[]>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComArea[]>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAreasByUserAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            Result<ServiceComArea[]> result = await _service.GetAreasByUserAsync(idNavisionUser);
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
            //http://led-servicecomtools/Login/RecuperarUsuario?login=e0384919&password=asasd
        }

        /// <summary>
        /// Obtiene los datos de usuario en base al login y password y actualiz o crea un usuario en UserUtils
        /// </summary>
        /// <param name="login"></param>
        /// <param name="pass"></param>
        /// <returns></returns>
        [HttpGet("user/login")]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserWithLoginAsync(
            string login = "i.molina-ext@lefebvreelderecho.com"
            , string pass = "imolina2"
            )
        {
            if (string.IsNullOrEmpty(login))
                return (IActionResult)BadRequest("id encoded value invalid. Must be a valid encoded user");

            //Todo: actualizar con el upsert del usuario en mongo
            Result<ServiceComUser> result = await _service.GetUserDataWithLoginAsync(login, pass);
            return Ok(result);
        }

        [HttpGet("user/entrada")]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<ServiceComUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserWithEntradaAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id encoded value invalid. Must be a valid encoded user");

            Result<ServiceComUser> result = await _service.GetUserDataWithEntryAsync(idNavisionUser);
            return Ok(result);
        }

        /// <summary>
        /// Permite agregar un usuario con los datos de aplicación
        /// </summary>
        /// <returns></returns>
        [HttpPost("user")]
        [ProducesResponseType(typeof(Result<UserUtilsModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserUtilsModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserPostAsync(
              [FromBody] UserUtilsModel user
            )
        {
            if (string.IsNullOrEmpty(user.idNavision))
                return BadRequest("value invalid. Must be a valid idNavision");

            Result<UserUtilsModel> result = await _service.PostUserAsync(user);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite obtener una usuario con sus datos de aplicaciones
        /// </summary>
        /// <returns></returns>
        [HttpGet("user")]
        [ProducesResponseType(typeof(Result<UserUtilsModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserUtilsModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserGetAsync(
              [FromQuery] string IdNavision = "E1621396"
            )
        {
            if (string.IsNullOrEmpty(IdNavision))
                return BadRequest("value invalid. Must be a valid idNavision");

            Result<UserUtilsModel> result = await _service.GetUserAsync(IdNavision);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite borrar un usuario
        /// </summary>
        /// <returns></returns>
        [HttpPost("user/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserRemoveAsync(
              [FromBody] string idNavision
            )
        {
            if (string.IsNullOrEmpty(idNavision))
                return BadRequest("value invalid. Must be a valid idnavision");

            Result<bool> result = await _service.RemoveUserAsync(idNavision);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion User

        /// <summary>
        /// Devueve una redirección hacia una url
        /// </summary>
        /// <returns></returns>
        [HttpGet("user/apps/redirect")]
        [ProducesResponseType(typeof(RedirectResult), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(RedirectResult), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ByPassUrlAsync(
              [FromQuery] string NameService = "Lex-On",
              [FromQuery] string idUser = "E1621396"
            )
        {
            Result<string> resultUserUtils = await _service.GetUserUtilsActualToServiceAsync(idUser, NameService);

            return Redirect(resultUserUtils.data);
        }
    }
}