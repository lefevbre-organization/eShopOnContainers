using System;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Google.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    [ApiController]
    [Route("api/v1/Credential")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class SuccessController : Controller
    {
        private readonly ApplicationDbContext context;

        public SuccessController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [Route("Drive/Success")]
        public async Task<ActionResult> GetDrive([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope)
        {
            User user = await context.Users.FirstOrDefaultAsync(x => x.Id == Guid.Parse(state));

            return Ok("El usuario fue autenticado con éxito!");
        }

        [HttpGet]
        [Route("Calendar/Success")]
        public async Task<ActionResult> GetCalendar([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope)
        {
            User user = await context.Users.FirstOrDefaultAsync(x => x.Id == Guid.Parse(state));

            return Ok("El usuario fue autenticado con éxito!");
        }

        [HttpGet]
        [Route("Mail/Success")]
        public async Task<ActionResult> GetMail([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope)
        {
            User user = await context.Users.FirstOrDefaultAsync(x => x.Id == Guid.Parse(state));

            return Ok("El usuario fue autenticado con éxito!");
        }
        

    }
}