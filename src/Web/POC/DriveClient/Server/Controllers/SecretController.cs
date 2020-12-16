using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lefebvre.Shared;
using Lefebvre.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.Server.Controllers
{
    
    [ApiController]
    [Route("[controller]")]
    public class SecretController : ControllerBase
    {
        private readonly ApplicationDbContext context;

        public SecretController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet(Name = "GetSecret")]
        [Route("[action]")]
        public async Task<ActionResult<GoogleSecret>> GetSecret([FromQuery] string UserId)
        {
            return Ok(await context.Secrets.Where(x => x.UserId == UserId).SingleOrDefaultAsync());
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<ActionResult> CreateSecret([FromBody] GoogleSecret secret)
        {
            GoogleSecret _secret = await context.Secrets.Where(x => x.UserId == secret.UserId).SingleOrDefaultAsync();

            if(_secret != null)
            {
                return BadRequest("Ya Existe un Secreto para este usuario");
            }

            secret.ClientReadOnly = false;
            secret.SaveKeys = true;
            await context.Secrets.AddAsync(secret);
            await context.SaveChangesAsync();

            return Ok(secret);
        }

    }
}