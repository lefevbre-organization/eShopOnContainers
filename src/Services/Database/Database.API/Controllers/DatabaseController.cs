using Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.Database.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private IDatabaseService _service;
        private readonly IOptions<DatabaseSettings> _settings;
        internal readonly ILogger<DatabaseController> _log;

        public DatabaseController(
          IDatabaseService service
          , IOptions<DatabaseSettings> settings
            , ILogger<DatabaseController> log
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
            var data = $"Database v.{ _settings.Value.Version}";
            System.Diagnostics.Trace.WriteLine(data);
            _log.LogDebug(data);
            return Ok(new Result<string>(data));
        }

        /// <summary>
        /// Permite obtener a sesion para poder realizar el resto de peticiones
        /// TODO: llevarla a Userutils
        /// </summary>
        /// <returns></returns>
        [HttpGet("sesion")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SesionAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return BadRequest("Must be a valid idUserNavision");

            Result<string> result = await _service.GetSesionAsync(idNavisionUser);

            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("documents/count")]
        [ProducesResponseType(typeof(Result<DbDocCount>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<DbDocCount>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEvaluationsAsync(
            string idNavisionUser = "E1621396",
            string search = "derecho"
            )
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("Must be a valid session Id");

            Result<DbDocCount> result = await _service.GetDocumentsCountAsync(idNavisionUser, search);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("documents")]
        [ProducesResponseType(typeof(Result<DbDocSearch>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<DbDocSearch>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDocumentsAsync(
            string idNavisionUser = "E1621396",
            string search = "derecho",
            string indice = "legislacion",
            int start = 1,
            int max = 10
            )
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("Must be a valid session Id");

            var result = await _service.GetDocumentsAsync(idNavisionUser, search, indice, start, max);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("documents/getone")]
        [ProducesResponseType(typeof(Result<DbDocument>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<DbDocument>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDocumentAsync(
            string sesion = "E1621396",
            string producto = "UNIVERSAL",
            string nref = "consultas"
            )
        {
            if (string.IsNullOrEmpty(sesion))
                return (IActionResult)BadRequest("Must be a valid session Id");

            Result<DbDocument> result = await _service.GetDocumentByNrefAsync(sesion, producto, nref);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("database")]
        [ProducesResponseType(typeof(Result<List<DbDocument>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<DbDocument>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDatabaseDocumentsAsync(
           string sesion = "E1621396",
           string search = "derecho",
           string producto = "UNIVERSAL",
           string orden = "relevancia",
           string universal = "derecho",
           string tipoDoc = "libro"
           )
        {
            if (string.IsNullOrEmpty(sesion))
                return (IActionResult)BadRequest("Must be a valid session Id");

            Result<List<DbDocument>> result = await _service.GetDbDocumentsAsync(sesion, search, producto, orden, universal, tipoDoc);
            return result.errors?.Count > 0 ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}