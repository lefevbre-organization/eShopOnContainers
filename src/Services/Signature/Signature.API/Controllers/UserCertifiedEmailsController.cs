namespace Signature.API.Controllers
{
    #region Usings
    using Infrastructure.Services;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    //using Microsoft.eShopOnContainers.Services.Signature.API.Model;
    using Microsoft.Extensions.Options;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Signature.API.Model;
    using RestSharp;
    using Microsoft.Extensions.Configuration;
    #endregion


    [Route("api/v1/CertifiedEmails]")]
    [ApiController]
    public class UserCertifiedEmailsController : ControllerBase
    {
        private readonly IEmailsService _emailsService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;

        public UserCertifiedEmailsController(
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


        [HttpGet]
        [Route("{user}")]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<Signatures>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetByUser([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _emailsService.GetUser(user);

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

            var result = await _emailsService.Create(signatureIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

    }
}
