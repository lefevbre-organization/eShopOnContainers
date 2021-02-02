using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Context;
    using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using Newtonsoft.Json;
    using System.Net;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class CredentialController : Controller
    {
        private readonly ICredentialService _service;
        private readonly GoogleAccountSettings _settings;
        private readonly IEventBus _eventBus;

        public CredentialController(
            ICredentialService service,
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

        [HttpGet("{LefebvreCredential}/[action]")]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<UserResponse>> GetUserCredentail([FromQuery] string LefebvreCredential)
        {
            return Ok(await _service.GetUserCredential(LefebvreCredential));
        }

        [HttpGet("{LefebvreCredential}/[action]")]]
        [ProducesResponseType(typeof(Result<List<UserCredentialResponse>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<UserCredentialResponse>>), (int)HttpStatusCode.NoContent)]
        public async Task<ActionResult<List<UserCredentialResponse>>> GetCredentialsUser([FromQuery] string LefebvreCredential)
        {
            return Ok(await _service.GetUserCredential(LefebvreCredential));
        }

        [HttpGet("{LefebvreCredential}/[action]/{Product}")]
        [ProducesResponseType(typeof(Result<OAuth2TokenModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<OAuth2TokenModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<OAuth2TokenModel>> GetToken([FromQuery] string LefebvreCredential, [FromQuery] GoogleProduct Product)
        {
            return Ok(await _service.GetToken(LefebvreCredential, Product));
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<UserResponse>> CreateUserCredential([FromBody] string LefebvreCredential)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest();

            return Ok(await _service.CreateUserCredential(LefebvreCredential));
        }

        [HttpPost("{LefebvreCredential}/[action]")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> CreateCredential([FromQuery] string LefebvreCredential, [FromBody] CreateCredentialRequest request)
        {
            if (request == null)
                return BadRequest();

            if (string.IsNullOrEmpty(request.ClientId) || string.IsNullOrEmpty(request.Secret) || string.IsNullOrEmpty(request.GoogleMailAccount))
                return BadRequest();

            return Ok(await _service.CreateCredential(LefebvreCredential, request));
        }

        [HttpGet("{LefebvreCredential}/[action]/Product/{product}")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<string>> GetAuthorizationLink([FromQuery] string LefebvreCredential, [FromQuery] GoogleProduct product)
        {
            return Ok(await _service.GetAuthorizationLink(LefebvreCredential, product));
        }


    }
}