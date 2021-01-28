using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Models;
using Google.Models;
using Google.Models.Enumerators;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class CredentialController : Controller
    {
        private readonly ApplicationDbContext context;

        public CredentialController(ApplicationDbContext context)
        {
            this.context = context;
        }
        
        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<UserResponse>> GetUserCredentail([FromQuery] Guid LefebvreCredential)
        {
            User user = await context.Users.SingleOrDefaultAsync(x => x.Id == LefebvreCredential);

            if(user == null)
            {
                return NoContent();
            }
            
            return Ok(new UserResponse());
        }

        [HttpGet]
        [Route("{LefebvreCredential}/[action]")]
        public async Task<ActionResult<IEnumerable<UserCredentialResponse>>> GetCredentialsUser(Guid LefebvreCredential)
        {
            User user = await context.Users.SingleOrDefaultAsync(x => x.Id == LefebvreCredential);
            if(user == null)
            {
                return NoContent();
            }

            return Ok(new List<UserCredentialResponse>());

        }

        [HttpGet]
        [Route("{LefebvreCredential}/[action]/{Product}")]
        public async Task<ActionResult> GetToken(string LefebvreCredential, GoogleProduct Product)
        {
            await Task.Delay(1);
            return Ok();
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<ActionResult<User>> CreateUserCredential([FromBody] string LefebvreCredential )
        {
            
            User user = await context.Users.SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user != null)
            {
                return BadRequest("User Exist");
            }

            user = new User(){
                Id = Guid.NewGuid(),
                LefebvreCredential = LefebvreCredential
            };

            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            return Ok(user);
        }

        [HttpPost]
        [Route("{LefebvreCredential}/[action]")]
        public async Task<ActionResult<string>> CreateCredential(Guid LefebvreCredential, [FromBody] CreateCredentialRequest request)
        {
            await Task.Delay(1);
            return Ok();
        }


    }
}