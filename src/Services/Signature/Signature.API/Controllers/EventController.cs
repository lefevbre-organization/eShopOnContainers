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
    using System.Web;
    using Microsoft.Extensions.Configuration;
    using System.Net.Http;
    using System.Net.Http.Headers;

    #endregion
    [Route("api/v1/SignaturitEvent")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly ISignaturesService _signaturesService;
        private readonly SignatureSettings _settings;
        //private readonly IEventBus _eventBus;

        public EventController(
            ISignaturesService signaturesService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            )//, IEventBus eventBus)
        {
            _signaturesService = signaturesService ?? throw new ArgumentNullException(nameof(signaturesService));
            _settings = signatureSettings.Value;
            //_eventBus = eventBus;
        }

        [HttpPost]
        [Route("post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> signatureEvent([FromBody] EventInfo eventinfo)
        {
            try
            {
                if (eventinfo.Status == "document_completed")
                {
                    var signatureId = eventinfo.Signature.Id;

                    var documentId = eventinfo.DocumentId;

                    var logResult = await _signaturesService.SaveEvent(eventinfo);

                    var result = await _signaturesService.GetSignature(signatureId, documentId);

                    return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
                }
            }
            catch (Exception)
            {

                throw;
            }
            

            return Ok();
        }

    }
}
