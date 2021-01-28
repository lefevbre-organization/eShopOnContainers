using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    [ApiController]
    [Route("api/v1/Credential")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class RevokeController : Controller
    {
        [HttpGet]
        [Route("{LefebvreCredential}/Drive/Revoke")]
        public async Task<ActionResult> GetDrive()
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpGet]
        [Route("{LefebvreCredential}/Calendar/Revoke")]
        public async Task<ActionResult> GetCalendar()
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpGet]
        [Route("{LefebvreCredential}/Mail/Revoke")]
        public async Task<ActionResult> GetMail()
        {
            await Task.Delay(1);
            return Ok();
        }
    }
}