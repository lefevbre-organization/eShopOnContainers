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
    using System.Diagnostics;

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
                Console.WriteLine($"START signatureEvent");

                var finalResult = new Result<bool>();
              
                if (eventinfo.Type == "document_completed" || eventinfo.Type == "audit_trail_completed" ||
                    eventinfo.Type == "document_canceled" || eventinfo.Type == "document_expired" || eventinfo.Type == "error" || eventinfo.Type == "document_declined")
                {
                    var signatureId = eventinfo.Document.Signature.Id;
                    var documentId = eventinfo.Document.DocumentId;
                    var logResult = await _signaturesService.SaveEvent(eventinfo);

                    Console.WriteLine($"Event saved in Mongo");
                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent start");

                    var processResult = _signaturesService.ProcessEvent(signatureId, documentId, eventinfo.Type);

                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent end");

                    finalResult.data = logResult.data && finalResult.data;
                    if (logResult.infos.Count > 0)
                    {
                        finalResult.infos.Add(logResult.infos[0]);
                    }
                    if (logResult.errors.Count > 0)
                    {
                        finalResult.errors.Add(logResult.errors[0]);
                    }

                    Console.WriteLine($"END signatureEvent");
                    return (finalResult.errors.Count > 0) ? (IActionResult)BadRequest(finalResult) : Ok(finalResult);
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
                if (password != _configuration.GetValue<string>("EventController"))
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


        [HttpPost]
        [Route("sync/post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> signatureEventSync([FromBody] SignEventInfo eventinfo)
        {
            try
            {
                Console.WriteLine($"START signatureEvent");

                var finalResult = new Result<bool>();

                if (eventinfo.Type == "document_completed" || eventinfo.Type == "audit_trail_completed" ||
                    eventinfo.Type == "document_canceled" || eventinfo.Type == "document_expired" || eventinfo.Type == "error" || eventinfo.Type == "document_declined")
                {
                    var signatureId = eventinfo.Document.Signature.Id;
                    var documentId = eventinfo.Document.DocumentId;
                    var logResult = await _signaturesService.SaveEvent(eventinfo);
                    
                    Console.WriteLine($"Event saved in Mongo");
                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent start");

                    var processResult = await _signaturesService.ProcessEvent(signatureId, documentId, eventinfo.Type);

                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent end");

                    finalResult.data = logResult.data && finalResult.data;
                    if (logResult.infos.Count > 0)
                    {
                        finalResult.infos.Add(logResult.infos[0]);
                    }
                    if (logResult.errors.Count > 0)
                    {
                        finalResult.errors.Add(logResult.errors[0]);
                    }
                    if (processResult.infos.Count > 0)
                    {
                        finalResult.infos.Add(processResult.infos[0]);
                    }
                    if (processResult.errors.Count > 0)
                    {
                        finalResult.errors.Add(processResult.errors[0]);
                    }

                    Console.WriteLine($"END signatureEvent");
                    return (finalResult.errors.Count > 0) ? (IActionResult)BadRequest(finalResult) : Ok(finalResult);
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
