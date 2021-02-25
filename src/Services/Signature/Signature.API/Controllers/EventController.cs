using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Controllers
{
    #region Usings
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using Signature.API.Model;
    using Microsoft.Extensions.Configuration;

    #endregion
    [Route("api/v1/SignaturitEvent")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly ISignaturesService _signaturesService;
        private readonly IEmailsService _emailsService;
        private readonly ISmsService _smsService;
        private readonly SignatureSettings _settings;
        private readonly IConfiguration _configuration;
        //private readonly IEventBus _eventBus;

        public EventController(
            ISignaturesService signaturesService
            , IEmailsService emailsService
            , ISmsService smsService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            , IConfiguration configuration
            )//, IEventBus eventBus)
        {
            _signaturesService = signaturesService ?? throw new ArgumentNullException(nameof(signaturesService));
            _emailsService = emailsService ?? throw new ArgumentNullException(nameof(emailsService));
            _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
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

        // Este hace todas las llamadas signaturit y centinela síncronas
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


        [HttpPost]
        [Route("signature/post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> signatureEvent2([FromBody] SignEventInfo eventinfo)
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

        [HttpPost]
        [Route("certifiedEmail/post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> certifiedEmailEvent([FromBody] EmailEventInfo eventinfo)
        {
            try
            {
                Console.WriteLine($"START emailEvent");

                var finalResult = new Result<bool>();

                if (eventinfo.Type == "certification_completed")
                {
                    //var signatureId = eventinfo.Document.Signature.Id;
                    var certificateId = eventinfo.Certificate.CertificateId;

                    var logResult = await _emailsService.SaveEvent(eventinfo);

                    Console.WriteLine($"Event saved in Mongo");
                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent start");

                    var processResult = _emailsService.ProcessEvent(certificateId, eventinfo.Type);

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

                    Console.WriteLine($"END emailEvent");
                    return (finalResult.errors.Count > 0) ? (IActionResult)BadRequest(finalResult) : Ok(finalResult);
                }
            }
            catch (Exception)
            {
                throw;
            }


            return Ok();
        }

        [HttpPost]
        [Route("certifiedSms/post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> certifiedSmsEvent([FromBody] SmsEventInfo eventinfo)
        {
            try
            {
                Console.WriteLine($"START smsEvent");

                var finalResult = new Result<bool>();

                if (eventinfo.Type == "certification_completed")
                {
                    //var signatureId = eventinfo.Document.Signature.Id;
                    var certificateId = eventinfo.Certificate.CertificateId;

                    var logResult = await _smsService.SaveEvent(eventinfo);

                    Console.WriteLine($"Event saved in Mongo");
                    Console.WriteLine($"[{DateTime.Now}] Call to ProcessEvent start");

                    var processResult = _smsService.ProcessEvent(certificateId, eventinfo.Type);

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

                    Console.WriteLine($"END smsEvent");
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
        [Route("events/signature/get/{id}")]
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

        [HttpGet]
        [Route("events/certifiedEmail/get/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> getEventsEmail([FromHeader] string password, string id = "all")
        {
            var result = new Result<List<EmailEventInfo>>();

            try
            {
                if (password != _configuration.GetValue<string>("EventController"))
                {
                    return Unauthorized();
                }
                result = await _emailsService.GetEvents(id);
            }
            catch (Exception)
            {
                throw;
            }
            return Ok(result);
        }

        [HttpGet]
        [Route("events/certifiedSms/get/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> getEventsSms([FromHeader] string password, string id = "all")
        {
            var result = new Result<List<SmsEventInfo>>();

            try
            {
                if (password != _configuration.GetValue<string>("EventController"))
                {
                    return Unauthorized();
                }
                result = await _smsService.GetEvents(id);
            }
            catch (Exception)
            {
                throw;
            }
            return Ok(result);
        }

    }
}