﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Controllers
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using Models;

    [Route("api/v1/[controller]")]
    [ApiController]
    public class CentinelaController : ControllerBase
    {
        private ICentinelaService _service;
        private readonly IOptions<CentinelaSettings> _settings;
        internal readonly ILogger<CentinelaController> _log;

        public CentinelaController(
          ICentinelaService service
          , IOptions<CentinelaSettings> settings
            , ILogger<CentinelaController> log
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _log = log ?? throw new ArgumentNullException(nameof(log));
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"Centinela v.{ _settings.Value.Version}";
            System.Diagnostics.Trace.WriteLine(data);
            _log.LogDebug(data);
            return Ok(new Result<string>(data));
        }

        /// <summary>
        /// Permite obtener el usuario de centinela junto con su contenido (evaluaciones)
        /// </summary>
        /// <returns></returns>
        [HttpGet("user")]
        [ProducesResponseType(typeof(Result<CenUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CenUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return BadRequest("Must be a valid idUserNavision");

            var result = await _service.GetUserAsync(idNavisionUser);

            return result.data?.evaluations?.Length > 0 ? Ok(result) : (IActionResult)BadRequest(result);
        }

        [HttpGet("evaluations")]
        [ProducesResponseType(typeof(Result<List<CenEvaluation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenEvaluation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEvaluationsAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetEvaluationsAsync(idNavisionUser);
            return result.data?.Count() > 0 ? Ok(result) : (IActionResult)BadRequest(result);
        }

        [HttpGet("evaluations/getbyid")]
        [ProducesResponseType(typeof(Result<CenEvaluation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CenEvaluation>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEvaluationByIdAsync(string idNavisionUser = "E1621396", int idEvaluation = 4509)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetEvaluationByIdAsync(idNavisionUser, idEvaluation);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("evaluations/tree/getbyid")]
        [ProducesResponseType(typeof(Result<List<CenEvaluationTree>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenEvaluationTree>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEvaluationTreeByIdAsync(string idNavisionUser = "E1621396", int idEvaluation = 4509)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetEvaluationTreeByIdAsync(idNavisionUser, idEvaluation);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("concepts/instances")]
        [ProducesResponseType(typeof(Result<List<CenConcept>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenConcept>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConceptsByTypeAsync(string idNavisionUser = "E1621396", int idConcept = 107229)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetConceptsByTypeAsync(idNavisionUser, idConcept);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("contacts")]
        [ProducesResponseType(typeof(Result<List<CenContact>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenContact>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetContactsAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetContactsAsync(idNavisionUser);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("smscontacts")]
        [ProducesResponseType(typeof(Result<List<CenContact>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenContact>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetSmsContactsAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetSmsContactsAsync(idNavisionUser);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("documents")]
        [ProducesResponseType(typeof(Result<List<CenDocument>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenDocument>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDocumentsAsync(string idNavisionUser = "E1621396", string search = "")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetDocumentsAsync(idNavisionUser, search);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result); 
        }

        [HttpGet("documents/instance")]
        [ProducesResponseType(typeof(Result<List<CenDocumentObject>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenDocumentObject>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDocumentsByInstanceAsync(string idNavisionUser = "E1669460", string conceptObjectId = "75823")
        {
            // https://centinela-api.lefebvre.es/api/secure/conectamail/documentobjects/conceptobject/75823?IdEntrada=E1669460
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            var result = await _service.GetDocumentsByInstanceAsync(idNavisionUser, conceptObjectId);
            return result.errors?.Count() > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("concepts/files/post")]
        [RequestSizeLimit(104857600)]
        [ProducesResponseType(typeof(Result<ConceptFile>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> FilePost(
        [FromBody] ConceptFile file
        )
        {
            Result<ConceptFile> resultFile = new Result<ConceptFile>(file);
            var result = await _service.FilePostAsync(file);

            if (result.errors.Count == 0)
            {   
                resultFile.errors = result.errors;
                resultFile.infos = result.infos;
                return StatusCode(201, resultFile);
            }

            return BadRequest(result);
        }

        [HttpGet("concepts/files/get")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> FileGet(
            [FromQuery] string idNavisionUser = "E1669460",
            [FromQuery] string idDocument = "78927"
            )
        {

            var result = await _service.FileGetAsync(idNavisionUser, idDocument);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);

        }

        [HttpPost("signatures/files/post/")]
        [HttpPost("signatures/audit/post/")]
        [ProducesResponseType(typeof(Result<ConceptFile>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SignatureFilePost(
            [FromBody] ConceptFile file
        )
        {
            Console.WriteLine($"START {Request.Path.Value}");

            var resultFile = new Result<ConceptFile>(file);
            var result = await _service.FilePostAsync(file, Request.Path.Value);

            if (result.errors.Count == 0)
            {
                resultFile.errors = result.errors;
                resultFile.infos = result.infos;
                return StatusCode(201, resultFile);
            }

            Console.WriteLine($"END {Request.Path.Value}");

            return BadRequest(result);
        }

        [HttpPost("signatures/audit/post/certification/email")]
        [HttpPost("signatures/audit/post/certification/sms")]
        [ProducesResponseType(typeof(Result<ConceptFile>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EmailCertificationPost(
            [FromBody] CertificationFile file
        )
        {
            Console.WriteLine($"START {Request.Path.Value}");

           var resultFile = new Result<CertificationFile>(file);
            var result = await _service.CertificationPostAsync(file, Request.Path.Value);

            if (result.errors.Count == 0)
            {
                resultFile.errors = result.errors;
                resultFile.infos = result.infos;
                return StatusCode(201, resultFile);
            }


            Console.WriteLine($"END {Request.Path.Value}");

            return BadRequest(result);
        }


        [HttpPost("signatures/cancelation/{guid}")]
        [ProducesResponseType(typeof(Result<ConceptFile>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CancelSignature([FromRoute] string guid)
        {
            Console.WriteLine($"START {Request.Path.Value}");

            var result = await _service.CancelSignatureAsync(guid);

            if (result.errors.Count == 0)
            {
                return StatusCode(201, result);
            }

            Console.WriteLine($"END {Request.Path.Value}");

            return BadRequest(result);
        }

        [HttpPost("signatures/notify/{service}/{guid}/{documentId}")]
        [ProducesResponseType(typeof(Result<ConceptFile>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> NotifySignature([FromRoute] string service, [FromRoute] string guid, [FromRoute] string documentId, [FromBody] List<CenRecipient> recipients)
        {
            Console.WriteLine($"START {Request.Path.Value}");

            var result = await _service.NotifySignatureAsync(service, guid, documentId, recipients);

            if (result.errors.Count == 0)
            {
                return StatusCode(201, result);
            }

            Console.WriteLine($"END {Request.Path.Value}");

            return BadRequest(result);
        }
    }
}