using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Models.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Controllers
{

    [ApiController]
    [Route("api/v1/User/{LefebvreCredential}/[controller]")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class FilesController : Controller
    {

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<List<GDriveFile>>> Tree()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<List<GDriveFile>>> GetAllFiles()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]/{DriveId}")]
        public async Task<ActionResult<List<GDriveFile>>> GetAllFilesToDrive()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]/{FolderId}")]
        public async Task<ActionResult<List<GDriveFile>>> GetAllFilesToFolder()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]/{FileId}")]
        public async Task<ActionResult<GDriveFile>> GetFile(string FileId)
        {
            await Task.Delay(1);
            return Ok(new GDriveFile());
        }

        [HttpGet]
        [Route("[action]/{Search}")]
        public async Task<ActionResult<List<GDriveFile>>> GetSearch(string Search)
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        
        [HttpDelete]
        [Route("[action]/{FileId}")]
        public async Task<ActionResult> Delete(string FileId)
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpDelete]
        [Route("[action]")]
        public async Task<ActionResult> Trash()
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpPost]
        [Route("[action]/{FolderId}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<List<GDriveFile>>> UploadFilesToFolder(List<IFormFile> files)
        {
            await Task.Delay(1);
            return Ok(new List<GDrive>());
        }

        [HttpPost]
        [Route("[action]/{DriveId}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<List<GDriveFile>>> UploadFilesToDrive(List<IFormFile> files)
        {
            await Task.Delay(1);
            return Ok(new List<GDrive>());
        }
        
    }
}