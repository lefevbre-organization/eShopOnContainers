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

    [Route("api/v1/Signatures")]
    [ApiController]
    public class UserSignaturesController : ControllerBase
    {
        private readonly ISignaturesService _signaturesService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;

        //private readonly IEventBus _eventBus;

        public UserSignaturesController(
            ISignaturesService signaturesService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            , IConfiguration configuration
            )//, IEventBus eventBus)
        {
            _signaturesService = signaturesService ?? throw new ArgumentNullException(nameof(signaturesService));
            _settings = signatureSettings.Value;
            _configuration = configuration;
            //_eventBus = eventBus;
        }

        //Get all signatures of a specific user
        [HttpGet]
        [Route("{user}")]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetByUser([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _signaturesService.GetUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        //Create a new user with a signature
        [HttpPost]
        [ProducesResponseType(typeof(Result<UserSignatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserSignatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser([FromBody] UserSignatures signatureIn)
        {
            if (string.IsNullOrEmpty(signatureIn.User))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _signaturesService.Create(signatureIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Deletes all the signatures of a user
        [HttpPost]
        [Route("{user}/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteUser([FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to delete the signatures");

            var result = await _signaturesService.Remove(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Adds a signature to the given user
        [HttpPost]
        [Route("{user}/signature/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostSignature([FromRoute]string user, [FromBody] Signature signatureIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(signatureIn.ExternalId) || string.IsNullOrEmpty(signatureIn.Guid) || string.IsNullOrEmpty(signatureIn.App))
                return BadRequest("values invalid. Must be a valid user, signatureId, app and guid to insert the signature");

            var result = await _signaturesService.UpSertSignature(user, signatureIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("{user}/setAvailableSignatures")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddAvailableSignatures([FromRoute]string user, [FromBody] int num)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user");

            var result = await _signaturesService.AddAvailableSignatures(user, num);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("{user}/getAvailableSignatures")]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAvailableSignatures([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _signaturesService.GetAvailableSignatures(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("{user}/DecAvailableSignatures")]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DecAvailableSignatures([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _signaturesService.AddAvailableSignatures(user, -1);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Adds a branding to the given user
        [HttpPost]
        [Route("{user}/branding/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostBranding([FromRoute]string user, [FromBody] UserBranding brandingIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(brandingIn.app) || string.IsNullOrEmpty(brandingIn.externalId))
                return BadRequest("values invalid. Must be a valid user, branding app and branding externalId");

            var result = await _signaturesService.UpSertBranding(user, brandingIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        //[HttpGet]
        //[Route("signaturit/getSignatures/{user}")]
        //[ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        //[ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> GetSignaturitBrandings([FromRoute]string user)
        //{
        //    var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures.json?lefebvre_id={user}");
        //    client.Timeout = -1;
        //    var request = new RestRequest(Method.GET);
        //    request.AddHeader("Authorization", "Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy");
        //    IRestResponse response = client.Execute(request);
        //    Console.WriteLine(response.Content);

        //    //if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(brandingIn.app) || string.IsNullOrEmpty(brandingIn.externalId))
        //    //    return BadRequest("values invalid. Must be a valid user, branding app and branding externalId");

        //    //var result = await _signaturesService.UpSertBranding(user, brandingIn);

        //    return Ok(response.Content);
        //}

        [HttpGet]
        [Route("{user}/checkAvailableSignatures/{nDocuments}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> checkAvailableSignatures([FromRoute] string user , [FromRoute] int nDocuments)
        {
            if (string.IsNullOrEmpty(user))
                return (IActionResult)BadRequest("invalid user value");
            if (nDocuments < 1)
                return (IActionResult)BadRequest("invalid nDocuments value");

            var result = await _signaturesService.checkAvailableSignatures(user, nDocuments);

            return (IActionResult)Ok(result.Content);
            //return (IActionResult)Ok(false);
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

            var result = await _signaturesService.ResetUserBrandings(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

    }
}
