using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using Google.Credentials.Context;
using Google.Models;
using Google.Models.Enumerators;
using Google.Models.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{

    [ApiController]
    [Route("api/v1/Credential")]
    [Produces("application/json")]
    [Consumes("application/json")]
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            this.context = context;
            this.configuration = configuration;
        }

        private string GetGoogleTokenUrl(string clientid, string secret, string code, string url)
        {

            StringBuilder googletoken = new StringBuilder();

            googletoken.Append("https://oauth2.googleapis.com/token?");
            googletoken.Append("client_id=");
            googletoken.Append(clientid);
            googletoken.Append("&client_secret=");
            googletoken.Append(secret);
            googletoken.Append("&code=");
            googletoken.Append(code);
            googletoken.Append("&grant_type=authorization_code");
            googletoken.Append("&redirect_uri=");
            googletoken.Append(url);

            return googletoken.ToString();

        }

        [HttpGet]
        [Route("Drive/Success")]
        public async Task<ActionResult> GetDrive([FromQuery] string state, [FromQuery] string code, [FromQuery] string scope, [FromQuery] string error = "")
        {

            if(string.IsNullOrEmpty(error))
            {
                User user = await context.Users.Include(x => x.Credentials).FirstOrDefaultAsync(x => x.Id == Guid.Parse(state));

                if(user == null)
                    return BadRequest();

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

                if(credential == null)
                    return NoContent();

                credential.Code = code;

                context.Credentials.Update(credential);
                await context.SaveChangesAsync();

                StringBuilder googletoken = new StringBuilder();

                googletoken.Append("https://oauth2.googleapis.com/token?");
                googletoken.Append("client_id=");
                googletoken.Append(credential.ClientId);
                googletoken.Append("&client_secret=");
                googletoken.Append(credential.Secret);
                googletoken.Append("&code=");
                googletoken.Append(credential.Code);
                googletoken.Append("&grant_type=authorization_code");
                googletoken.Append("&redirect_uri=");
                googletoken.Append(configuration["RedirectAuthSuccessDriveUrl"]);

                HttpClient client = new HttpClient();
                
                var response = await client.PostAsync(GetGoogleTokenUrl(credential.ClientId, credential.Secret, credential.Code, configuration["RedirectSuccessDriveUrl"]), null);

                if(response.IsSuccessStatusCode)
                {
                    var token = await response.Content.ReadFromJsonAsync<OAuth2TokenModel>();

                    credential.Access_Token = token.access_token;
                    credential.Refresh_Token = token.refresh_token;
                    credential.Scope = token.scope;
                    credential.Token_Type = token.token_type;
                    
                }else{
                    return BadRequest();
                }
                return Redirect(configuration["InternalRedirection"]);
            }else{
                return BadRequest(error);
            }
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