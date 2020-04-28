using Centinela.API.Models;
using Centinela.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Centinela.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CentinelaController : ControllerBase
    {
        private ICentinelaService _service;
        private readonly IOptions<CentinelaSettings> _settings;

        public CentinelaController(
          ICentinelaService service
          , IOptions<CentinelaSettings> settings
          )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        /// <summary>
        /// Permite obtener el usuario de centinela junto con su contenido (evaluaciones)
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpGet("user")]
        [ProducesResponseType(typeof(Result<CenUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<CenUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return BadRequest("Must be a valid idUserNavision");

            Result<CenUser> result = await _service.GetUserAsync(idNavisionUser);

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
            return result.errors?.Count() > 0 ? Ok(result) : (IActionResult)BadRequest(result);
        }

        [HttpGet("evaluations/tree/getbyid")]
        [ProducesResponseType(typeof(Result<List<CenEvaluationTree>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenEvaluationTree>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEvaluationTreeByIdAsync(string idNavisionUser = "E1621396", int idEvaluation = 4509)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            Result<List<CenEvaluationTree>> result = await _service.GetEvaluationTreeByIdAsync(idNavisionUser, idEvaluation);
            return result.errors?.Count() > 0 ? Ok(result) : (IActionResult)BadRequest(result);
            // /api/secure/conectamail/tree/evaluation/EVALUATION_ID?IdEntrada=ID_ENTRADA

            // /api/secure/conectamail/conceptobjects/concept/CONCEPT_ID?IdEntrada=ID_ENTRADA
        }

        [HttpGet("concepts")]
        [ProducesResponseType(typeof(Result<List<CenConcept>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenConcept>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetConceptsByTypeAsync(string idNavisionUser = "E1621396", int idConcept = 1)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            Result<List<CenConcept>> result = await _service.GetConceptsByTypeAsync(idNavisionUser, idConcept);
            return result.errors?.Count() > 0 ? Ok(result) : (IActionResult)BadRequest(result);
            // /api/secure/conectamail/tree/evaluation/EVALUATION_ID?IdEntrada=ID_ENTRADA

            // /api/secure/conectamail/conceptobjects/concept/CONCEPT_ID?IdEntrada=ID_ENTRADA
        }

        [HttpGet("documents")]
        [ProducesResponseType(typeof(Result<List<CenDocument>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<CenDocument>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDocumentsAsync(string idNavisionUser = "E1621396", string search = "")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id user value invalid. Must be a valid iduser");

            Result<List<CenDocument>> result = await _service.GetDocumentsAsync(idNavisionUser, search);
            return result.errors?.Count() > 0 ? Ok(result) : (IActionResult)BadRequest(result);
            // /api/secure/conectamail/tree/evaluation/EVALUATION_ID?IdEntrada=ID_ENTRADA

            // /api/secure/conectamail/conceptobjects/concept/CONCEPT_ID?IdEntrada=ID_ENTRADA
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
    }
}