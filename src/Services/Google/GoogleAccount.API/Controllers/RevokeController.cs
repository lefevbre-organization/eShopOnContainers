using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    using Context;
    using Model;

    [ApiController]
    [Route("api/v1/Credential")]
    public class RevokeController : Controller
    {
        private readonly ApplicationDbContext context;

        public RevokeController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [Route("{LefebvreCredential}/Drive/Revoke")]
        public async Task<ActionResult> GetDrive(string LefebvreCredential)
        {
        
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return BadRequest();

            Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

            if(credential == null)
                return NoContent();

            credential.Access_Token = "";
            credential.Refresh_Token = "";
            credential.Code = "";

            context.Credentials.Update(credential);
            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("{LefebvreCredential}/Calendar/Revoke")]
        public async Task<ActionResult> GetCalendar(string LefebvreCredential)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return BadRequest();

            Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Calendar && x.Active == true);

            if(credential == null)
                return NoContent();

            credential.Access_Token = "";
            credential.Refresh_Token = "";
            credential.Code = "";

            context.Credentials.Update(credential);
            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        [Route("{LefebvreCredential}/Mail/Revoke")]
        public async Task<ActionResult> GetMail(string LefebvreCredential)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return BadRequest();

            Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Gmail && x.Active == true);

            if(credential == null)
                return NoContent();

            credential.Access_Token = "";
            credential.Refresh_Token = "";
            credential.Code = "";

            context.Credentials.Update(credential);
            await context.SaveChangesAsync();

            return Ok();
        }
    }
}