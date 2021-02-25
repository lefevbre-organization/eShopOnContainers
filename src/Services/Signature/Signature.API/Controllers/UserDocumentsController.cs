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

    [Route("api/v1/CertifiedDocuments")]
    [ApiController]
    public class UserDocumentsController : ControllerBase
    {
        private readonly IDocumentsService _documentsService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;

        public UserDocumentsController(
            IDocumentsService documentsService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            , IConfiguration configuration
            )//, IEventBus eventBus)
        {
            _documentsService = documentsService ?? throw new ArgumentNullException(nameof(documentsService));
            _settings = signatureSettings.Value;
            _configuration = configuration;
            //_eventBus = eventBus;
        }

        // Get all certified documents from a user
        [HttpGet]
        [Route("{user}")]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetByUser([FromRoute] string user = "E1621396")
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("invalid user value");

            var result = await _documentsService.GetDocuments(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Get all certified documents from all users
        [HttpGet]
        [Route("all")]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CertifiedEmail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAll()
        {

            var result = await _documentsService.GetAll();

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Create a new user with a certified document
        [HttpPost]
        [Route("addUser")]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserEmails>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser([FromBody] UserCertDocuments certDocumentIn)
        {
            if (string.IsNullOrEmpty(certDocumentIn.User))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _documentsService.CreateDocument(certDocumentIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // Adds a new Certified Document to the given user
        [HttpPost]
        [Route("{user}/document/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostDocument([FromRoute] string user, [FromBody] CertDocument certDocumentIn)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(certDocumentIn.ExternalId) || string.IsNullOrEmpty(certDocumentIn.Guid) || string.IsNullOrEmpty(certDocumentIn.App))
                return BadRequest("values invalid. Must be a valid user, signatureId, app and guid to insert the document");

            var result = await _documentsService.UpSertDocument(user, certDocumentIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
