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
    using Microsoft.AspNetCore.Http;
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

            if(token.errors.Count > 0 || token.data == null)
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

            if(files.errors.Count > 0 || files.data == null)
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

            var filesResult = await _service.SearchFile(LefebvreCredential, Searcher);

            if(filesResult.errors.Count > 0 || filesResult.data == null)
              return BadRequest(filesResult);

            filesResult.infos.Add(new Info(){
              message = $"Cantidad de Items: {filesResult.data.Count}"
            });

            return Ok(filesResult);
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

            var fileDeleteResult = await _service.Delete(LefebvreCredential, FileId);

            if (fileDeleteResult.errors.Count > 0)
                return BadRequest(fileDeleteResult);

            return Ok(fileDeleteResult);
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

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateFolder(string LefebvreCredential, string folderName, string parentId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(folderName))
                return BadRequest("El nombre del nuevo fichero es requerido");

            var response = await _service.CreateFolder(LefebvreCredential, folderName,parentId);
            return Ok(response);
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UploadFile(string LefebvreCredential, IFormFile formFile, string parentId, string sessionId) { 

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (formFile == null)
                return BadRequest("El archivo es requerido");

            var response = await _service.UploadFile(LefebvreCredential, formFile, parentId,sessionId);
            return Ok(response);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DownloadFile(string LefebvreCredential, string fileId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("El ID del archivo es requerido");

            var file = await _service.DownloadFile(LefebvreCredential, fileId);
            return Ok(file);
        }

        [HttpPatch("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> MoveElement(string LefebvreCredential, string elementId, string parentId, string destinationId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(elementId))
                return BadRequest("El ID del elemento es requerido");


            var file = await _service.MoveElement(LefebvreCredential, elementId, parentId,destinationId);
            return Ok(file);
        }

        [HttpPatch("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RenameElement(string LefebvreCredential, string elementId, string currentName, string newName)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(elementId))
                return BadRequest("El ID del elemento es requerido");

            if (string.IsNullOrEmpty(currentName))
                return BadRequest("El nombre actual del elemento es requerido");

            if (string.IsNullOrEmpty(newName))
                return BadRequest("El nuevo nombre del elemento es requerido");


            var file = await _service.RenameElement(LefebvreCredential, elementId, currentName, newName);
            return Ok(file);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAvailableExportTypes(string LefebvreCredential, string fileId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("El ID del archivo es requerido");


            var file = await _service.GetAvailableExportTypes(LefebvreCredential, fileId);
            return Ok(file);
        }


        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ExportGoogleWorkspaceFile(string LefebvreCredential, string fileId, string mimeType)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("El ID del archivo es requerido");

            if (string.IsNullOrEmpty(mimeType))
                return BadRequest("El mimeType del archivo es requerido");


            var file = await _service.ExportFile(LefebvreCredential, fileId, mimeType);
            return Ok(file);
        }


    }
}