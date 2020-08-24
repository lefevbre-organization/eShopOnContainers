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
        private readonly IConfiguration _configuration;
        //private readonly IEventBus _eventBus;

        public EventController(
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

        [HttpPost]
        [Route("post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> signatureEvent([FromBody] SignEventInfo eventinfo)
        {
            try
            {
              
                if (eventinfo.Document.Status == "document_completed" || eventinfo.Document.Status == "audit_trail_completed")
                {
                    var signatureId = eventinfo.Document.Signature.Id;
                    var documentId = eventinfo.Document.DocumentId;
                    var logResult = await _signaturesService.SaveEvent(eventinfo);
                    var result = await _signaturesService.GetSignature(signatureId, documentId, eventinfo.Document.Status);

                    return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
                }
            }
            catch (Exception)
            {

                throw;
            }
            

            return Ok();
        }


        [HttpGet]
        [Route("events/get/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> getEvents([FromHeader] string password, string id = "all")
        {
            var result = new Result<List<SignEventInfo>>();

            try
            {
                
                if (password != _configuration.GetValue<string>("EventControllerPass"))
                {
                    return Unauthorized();
                }

                result = await _signaturesService.GetEvents(id);

                
            }
            catch (Exception)
            {

                throw;
            }


            return Ok(result);
        }

    }
}
