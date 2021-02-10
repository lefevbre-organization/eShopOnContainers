using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Controllers
{
    using Infrastructure.Services;
    using Model;

    [Route("api/v1/[controller]")]
    [ApiController]
    public class DriveController : ControllerBase
    {
        private IGoogleDriveService _service;
        private readonly IOptions<GoogleDriveSettings> _settings;
        internal readonly ILogger<DriveController> _log;

        public DriveController(
          IGoogleDriveService service
          , IOptions<GoogleDriveSettings> settings
            , ILogger<DriveController> log
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
            var data = $"Google Drive v.{ _settings.Value.Version}";
            //_log.LogError(data);
            return Ok(new Result<string>(data));
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUser(string LefebvreCredential)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            var token = await _service.GetCredential(LefebvreCredential);

            if(token.errors.Count == 0 && token.data == null)
              return BadRequest(token);

            return Ok(token);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetFiles(string LefebvreCredential)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            var files = await _service.GetFiles(LefebvreCredential);

            if(files.errors.Count == 0 && files.data == null)
              return BadRequest(files);

            files.infos.Add(new Info(){
              message = $"Cantidad de Items: {files.data.Count}"
            });

            return Ok(files);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Search(string LefebvreCredential, string Searcher)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            if(string.IsNullOrEmpty(Searcher))
              return BadRequest("Es necesario un término de búsqueda");

            var files = await _service.SearchFile(LefebvreCredential, Searcher);

            if(files.errors.Count == 0 && files.data == null)
              return BadRequest(files);

            files.infos.Add(new Info(){
              message = $"Cantidad de Items: {files.data.Count}"
            });

            return Ok(files);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Delete(string LefebvreCredential, string FileId)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            if(string.IsNullOrEmpty(FileId))
              return BadRequest("Es necesario un Id de un documento válido");

            var files = await _service.Delete(LefebvreCredential, FileId);
            return Ok(files);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Trash(string LefebvreCredential)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            var files = await _service.Trash(LefebvreCredential);
            return Ok(files);
        }
        
    }
}