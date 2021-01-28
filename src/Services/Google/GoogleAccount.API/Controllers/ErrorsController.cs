using System;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    [ApiController]
    [Route("api/v1/Credential")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class ErrorsController : Controller
    {
        private readonly ApplicationDbContext context;

        public ErrorsController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        [Route("Drive/Errors")]
        public async Task<ActionResult> GetDrive([FromQuery] string Errors)
        {
            await Task.Delay(1);
            return Ok(Errors);
        }

        [HttpGet]
        [Route("Calendar/Errors")]
        public async Task<ActionResult> GetCalendar([FromQuery] string Errors)
        {
            await Task.Delay(1);
            return Ok(Errors);
        }

        [HttpGet]
        [Route("Mail/Errors")]
        public async Task<ActionResult> GetMail([FromQuery] string Errors)
        {
            await Task.Delay(1);
            return Ok(Errors);
        }
    }
}