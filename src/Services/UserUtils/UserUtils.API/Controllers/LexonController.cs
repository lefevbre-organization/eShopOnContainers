using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LexonController : ControllerBase
    {
        private IUserUtilsService _service;
        private readonly IOptions<UserUtilsSettings> _settings;

        public LexonController(
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
            var data = $"UserUtils.Lexon v.{ _settings.Value.Version} - DefaultEnv:{_settings.Value.DefaultEnvironment}";
            return Ok(new Result<string>(data));
        }

        /// <summary>
        /// Permite obtener los token necesarios mediante login y password y eligiendo la aplicación adecuada
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/login")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequestLogin tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password))
                return BadRequest("Must be a valid login and password");

            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;

            var result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/login" });
            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token mandando id por querystring
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

            var token = new TokenRequest() { idClienteNavision = idClienteNavision , idApp= _settings.Value.IdAppLexon};

            var result = await _service.GetGenericTokenAsync(token, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/id" });
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios mediante un idUsarioNavision
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/basic")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequest tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision))
                return BadRequest("Must be a valid idClient");

            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;

            var result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/basic" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios mediante un idUsarioNavision y eligiendo la bd
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/db")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequestDataBase tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision) || string.IsNullOrEmpty(tokenRequest.bbdd))
                return BadRequest("Must be a valid idClient and bbdd");

            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;

            var result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/db" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para crear un nuevo mail
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/mail/new")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequestNewMail tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision)
                && (tokenRequest.idEntity != null && tokenRequest.idEntityType != null))
                return BadRequest("Must be a valid idClient and valid idtype and idEntityType");
            
            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;
            
            var result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/mail/new" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para crear un nuevo mail
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/mail/open")]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<TokenData>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenRequestOpenMail tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision)
                || string.IsNullOrEmpty(tokenRequest.idMail))
                return BadRequest("Must be a valid idClient and valid idMail");

            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;

            var result = await _service.GetGenericTokenAsync( tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/mail.open" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token con las msismas llamadas de lexonMysql antiguas
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token/lexon")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenModelView tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision)
                && (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password)))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");
         
            Result<LexUser> result = await _service.GetLexonGenericAsync(
                tokenRequest, _settings.Value.IdAppLexon, addTerminatorToToken);

            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/lexon old school" });

            if (result?.data != null)
                result.data.companies = null;

            return Ok(result);
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
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/validation" });

            return result.data.valid ? Ok(result) : (IActionResult)BadRequest(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios mandando login y pass por post
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPost("token"), Consumes("application/json", "application/xml", "application/x-www-form-urlencoded", "multipart/form-data", "text/plain; charset=utf-8", "text/html")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenPostAsync(
              [FromForm] string login = "i.molina-ext@lefebvreelderecho.com"
             , [FromForm] string password = "imolina2"
             , [FromForm] bool addTerminatorToToken = true
            )
        {
            var tokenRequest = new TokenRequestLogin { login = login, password = password};

            if (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            if (tokenRequest.idApp == null)
                tokenRequest.idApp = _settings.Value.IdAppLexon;

            var result = await _service.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            result.infos.Add(new Info() { code = "UserUtils.Lexon", message = "token/post" });

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}