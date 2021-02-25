namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Controllers
{
    #region Usings
    using Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using System;
    using System.Net;
    using System.Threading.Tasks;
    using Signature.API.Model;
    using Microsoft.Extensions.Configuration;
    #endregion


    [Route("api/v1/CertifiedSms")]
    [ApiController]
    public class UserSmsController : ControllerBase
    {
        private readonly ISmsService _smsService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;

        public UserSmsController(
            ISmsService smsService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            , IConfiguration configuration
            )//, IEventBus eventBus)
        {
            _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
            _settings = signatureSettings.Value;
            _configuration = configuration;
            //_eventBus = eventBus;
        }


        // Get all certified emails from a user
        [HttpGet]
        [Route("{user}")]
        [ProducesResponseType(typeof(Result<CertifiedSms>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedSms>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetByUser([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _smsService.GetSms(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("all")]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAll()
        {

            var result = await _smsService.GetAll();

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        // Create a new user with a certified email
        [HttpPost]
        [Route("addUser")]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser([FromBody] UserSms smsIn)
        {
            if (string.IsNullOrEmpty(smsIn.User))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _smsService.CreateSms(smsIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        // Adds a new Certified Sms to the given user
        [HttpPost]
        [Route("{user}/sms/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSms([FromRoute] string user, [FromBody] CertifiedSms smsIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(smsIn.ExternalId) || string.IsNullOrEmpty(smsIn.Guid) || string.IsNullOrEmpty(smsIn.App))
                return BadRequest("values invalid. Must be a valid user, smsId, app and guid to insert the sms");

            var result = await _smsService.UpSertSms(user, smsIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
