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
    public class FoldersController : Controller
    {
        

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<List<GDriveFile>>> GetAllFolders()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]/{FolderId}")]
        public async Task<ActionResult<GDriveFile>> GetFolder(string FolderId)
        {
            await Task.Delay(1);
            return Ok(new GDriveFile());
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<GDriveFile>> Create(string Name)
        {
            await Task.Delay(1);
            return Ok(new GDrive());
        }

        [HttpDelete]
        [Route("[action]/{FolderId}")]
        public async Task<ActionResult> Delete(string FolderId)
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpPost]
        [Route("[action]/{FolderId}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<List<GDriveFile>>> UploadFiles(List<IFormFile> files)
        {
            await Task.Delay(1);
            return Ok(new List<GDrive>());
        }

    }
}