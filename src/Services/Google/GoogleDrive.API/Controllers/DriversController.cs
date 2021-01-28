using System.Collections.Generic;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Models;
using Google.Models.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Controllers
{
    [ApiController]
    [Route("api/v1/User/{LefebvreCredential}/[controller]")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class DriversController : Controller
    {
        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<List<GDriveFile>>> GetAllDrives()
        {
            await Task.Delay(1);
            return Ok(new List<GDriveFile>());
        }

        [HttpGet]
        [Route("[action]/{DriveId}")]
        public async Task<ActionResult<GDriveFile>> GetDrive(string DriveId)
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
        [Route("[action]/{DriveId}")]
        public async Task<ActionResult> Delete(string DriveId)
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpPost]
        [Route("[action]/{DriveId}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<List<GDriveFile>>> UploadFiles(List<IFormFile> files)
        {
            await Task.Delay(1);
            return Ok(new List<GDrive>());
        }
    }
}