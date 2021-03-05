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
    using Newtonsoft.Json.Linq;
    using RestSharp;

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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public IActionResult Test()
        {
            var data = $"Google Drive v.{ _settings.Value.Version}";

            return Ok(new Result<string>(data));
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetUser([FromHeader] string Authorization)
        {

            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Token de acceso no encontrado");

            string LefebvreCredential = "";

            if (!checkToken(httpRequest.Headers["Authorization"], out LefebvreCredential))
                return BadRequest("Token de acceso invalido");

            var token = await _service.GetCredential(LefebvreCredential);

            if(token.errors.Count > 0 || token.data == null)
              return BadRequest(token);

            return Ok(token);
        }

        /*
        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetFiles([FromHeader] string Authorization)
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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> Search([FromHeader] string Authorization, string Searcher)
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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> Delete([FromHeader] string Authorization, string FileId)
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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> Trash([FromHeader] string Authorization)
        {

            if(string.IsNullOrEmpty(LefebvreCredential))
              return BadRequest("La Credencial de Lefebvre es requerida");

            var files = await _service.Trash(LefebvreCredential);
            return Ok(files);
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CreateFolder([FromHeader] string Authorization, string folderName, string parentId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(folderName))
                return BadRequest("El nombre del nuevo fichero es requerido");

            var response = await _service.CreateFolder(LefebvreCredential, folderName,parentId);
            return Ok(response);
        }

        [HttpPost("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> UploadFile([FromHeader] string Authorization, IFormFile formFile, string parentId, string sessionId) { 

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (formFile == null)
                return BadRequest("El archivo es requerido");

            var response = await _service.UploadFile(LefebvreCredential, formFile, parentId,sessionId);
            return Ok(response);
        }

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadFile([FromHeader] string Authorization, string fileId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("El ID del archivo es requerido");

            var file = await _service.DownloadFile(LefebvreCredential, fileId);
            return Ok(file);
        }

        [HttpPatch("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> RenameElement([FromHeader] string Authorization, string elementId, string currentName, string newName)
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
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetAvailableExportTypes([FromHeader] string Authorization, string fileId)
        {

            if (string.IsNullOrEmpty(LefebvreCredential))
                return BadRequest("La Credencial de Lefebvre es requerida");

            if (string.IsNullOrEmpty(fileId))
                return BadRequest("El ID del archivo es requerido");


            var file = await _service.GetAvailableExportTypes(LefebvreCredential, fileId);
            return Ok(file);
        }


        [HttpGet("[action]")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> ExportGoogleWorkspaceFile([FromHeader] string Authorization, string fileId, string mimeType)
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
        */
        #region Token
        private bool checkToken(string authToken, out string LefebvreCredential)
        {
            bool valid = false;
            var client = new RestClient($"{_settings.Value.LexonApiGwUrl}/utils/Lexon/token/validation?validateCaducity=false");
            client.Timeout = 10000;

            var request = new RestRequest(Method.PUT);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");
            request.AddParameter("application/json-patch+json,text/plain", $"\"{authToken}\"", ParameterType.RequestBody);

            IRestResponse response = client.Execute(request);

            if (response.IsSuccessful)
            {
                valid = (bool)JObject.Parse(response.Content).SelectToken("$..valid");
        
            }
            else
            {
                Console.WriteLine("Response is not successfull");
            }

            Console.WriteLine($"TokenValid:{valid} - {authToken}");

            //if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Preproduction" ||
            //Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            //{
            //    return true;
            //}
            LefebvreCredential = "";

            return valid;
        }
        #endregion
    }
}