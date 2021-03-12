using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Controllers
{
    #region Usings
    using Infrastructure.Services;
    using BuidingBlocks.Lefebvre.Models;
    using Signature.API.Model;
    #endregion


    [Route("api/v1/CertifiedEmails")]
    [ApiController]
    public class UserEmailsController : ControllerBase
    {
        private readonly IEmailsService _emailsService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;

        public UserEmailsController(
            IEmailsService emailsService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            , IConfiguration configuration
            )//, IEventBus eventBus)
        {
            _emailsService = emailsService ?? throw new ArgumentNullException(nameof(emailsService));
            _settings = signatureSettings.Value;
            _configuration = configuration;
            //_eventBus = eventBus;
        }


        // Get all certified emails from a user
        [HttpGet]
        [Route("{user}")]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetByUser([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _emailsService.GetEmails(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("all")]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAll()
        {
            
            var result = await _emailsService.GetAll();

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        // Create a new user with a certified email
        [HttpPost]
        [Route("addUser")]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser([FromBody] UserEmails emailIn)
        {
            if (string.IsNullOrEmpty(emailIn.User))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _emailsService.CreateEmail(emailIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        // Adds a new Certified Email to the given user
        [HttpPost]
        [Route("{user}/email/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostEmail([FromRoute] string user, [FromBody] CertifiedEmail emailIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(emailIn.ExternalId) || string.IsNullOrEmpty(emailIn.Guid) || string.IsNullOrEmpty(emailIn.App))
                return BadRequest("values invalid. Must be a valid user, signatureId, app and guid to insert the signature");

            var result = await _emailsService.UpSertEmail(user, emailIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        // Adds a branding to the given user
        [HttpPost]
        [Route("{user}/branding/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostBranding([FromRoute] string user, [FromBody] UserBranding brandingIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(brandingIn.app) || string.IsNullOrEmpty(brandingIn.externalId))
                return BadRequest("values invalid. Must be a valid user, branding app and branding externalId");

            var result = await _emailsService.UpSertBranding(user, brandingIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpPost]
        [Route("{user}/resetUserBranding")]
        [ProducesResponseType(typeof(Result<UserSignatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserSignatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ResetUserBrandings([FromHeader] string password, [FromRoute] string user)
        {
            if (password != _configuration.GetValue<string>("EventController"))
                return Unauthorized();

            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user or \"all\"");

            var result = await _emailsService.ResetUserBrandings(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


    }
}
