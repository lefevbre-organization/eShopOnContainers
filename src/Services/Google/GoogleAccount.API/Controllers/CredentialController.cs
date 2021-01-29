using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Credentials.Context;
using Google.Credentials.Models;
using Google.Models;
using Google.Models.Enumerators;
using Google.Models.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CredentialController : Controller
    {
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;
        private readonly IEventBus _eventBus;

        public CredentialController(
            ApplicationDbContext context, 
            IConfiguration configuration,
            IEventBus eventBus
            )
        {
            this.context = context;
            this.configuration = configuration;
        }

        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
        }

        [HttpGet]
        [Route("[action]")]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.Nocontent)]
        [ProducesResponseType(typeof(Result<UserResponse>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<UserResponse>> GetUserCredentail([FromQuery] Guid LefebvreCredential)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.Id == LefebvreCredential);

            if(user == null)
            {
                return NoContent(new Result<UserResponse>(user));
            }
            
            List<UserCredentialResponse> list = new List<UserCredentialResponse>();

            foreach (Credential credential in user.Credentials)
            {
                list.Add(new UserCredentialResponse(){
                    ClientId = credential.ClientId,
                    GoogleMailAccount = credential.GoogleMailAccount,
                    Product = credential.Product,
                    Secret = credential.Secret
                });
            }

            return Ok(new Result<UserResponse>(new UserResponse(){
                Id = user.Id,
                LefebvreCredential = user.LefebvreCredential,
            }));
        }

        [HttpGet]
        [Route("{LefebvreCredential}/[action]")]
        [ProducesResponseType(typeof(Result<IEnumerable<UserCredentialResponse>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<UserCredentialResponse>>), (int)HttpStatusCode.NoContent)]
        public async Task<ActionResult<IEnumerable<UserCredentialResponse>>> GetCredentialsUser(Guid LefebvreCredential)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.Id == LefebvreCredential);
            if(user == null)
            {
                return NoContent();
            }

            if(user.Credentials == null)
            {
                return NoContent();
            }

            List<UserCredentialResponse> list = new List<UserCredentialResponse>();

            foreach (Credential credential in user.Credentials)
            {
                list.Add(new UserCredentialResponse(){
                    ClientId = credential.ClientId,
                    GoogleMailAccount = credential.GoogleMailAccount,
                    Product = credential.Product,
                    Secret = credential.Secret
                });
            }


            return Ok( new Result<IEnumerable<UserCredentialResponse>>(list));

        }

        [HttpGet]
        [Route("{LefebvreCredential}/[action]/{Product}")]
        [ProducesResponseType(typeof(Result<OAuth2TokenModel>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<OAuth2TokenModel>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<OAuth2TokenModel>> GetToken(string LefebvreCredential, GoogleProduct Product)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return NoContent(new Result<OAuth2TokenModel>(null));

            var credential = user.Credentials.SingleOrDefault(x => x.Product == Product);

            if(credential == null)
                return NoContent(new Result<OAuth2TokenModel>(null));


            if (credential.TokenExpire)
            {
                HttpClient client = new HttpClient();

                OAuth2RefreshToken request = new OAuth2RefreshToken()
                {
                    client_id = credential.ClientId,
                    client_secret = credential.Secret,
                    refresh_token = credential.Refresh_Token,
                    grant_type = "refresh_token"
                };

                var refresh = await client.PostAsync("https://oauth2.googleapis.com/token", new StringContent(JsonSerializer.Serialize(request) , Encoding.UTF8, "application/json"));
                
                Console.WriteLine(JsonSerializer.Serialize(refresh));
                Console.WriteLine(JsonSerializer.Serialize(await refresh.Content.ReadAsStringAsync()));

                if(refresh.IsSuccessStatusCode)
                {
                    return await refresh.Content.ReadFromJsonAsync<OAuth2TokenModel>();
                }else{
                    return NoContent(new Result<OAuth2TokenModel>(null)); ;
                }
            }else{
                return NoContent(new Result<OAuth2TokenModel>(new OAuth2TokenModel(){
                    access_token = credential.Access_Token,
                    refresh_token = credential.Refresh_Token,
                    expires_in = credential.Duration,
                    scope = credential.Scope,
                    token_type = credential.Token_Type
                }));
            }

        }

        [HttpPost]
        [Route("[action]")]
        [ProducesResponseType(typeof(Result<User>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<User>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<User>> CreateUserCredential([FromBody] string LefebvreCredential )
        {
            
            User user = await context.Users.SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user != null)
            {
                return BadRequest(new Result<User>(null));
            }

            user = new User(){
                Id = Guid.NewGuid(),
                LefebvreCredential = LefebvreCredential
            };

            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            return Ok(new Result<User>(user));
        }

        [HttpPost]
        [Route("{LefebvreCredential}/[action]")]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> CreateCredential(string LefebvreCredential, [FromBody] CreateCredentialRequest request)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return NoContent(new Result<string>(""));

            Credential _credential = user.Credentials.SingleOrDefault
            (
                x => x.GoogleMailAccount == request.GoogleMailAccount && 
                x.Product == request.Product && 
                x.Active == true
            );

            if(_credential != null)
                return BadRequest(new Result<string>(""));

            Credential credential = new Credential()
            {
                ClientId = request.ClientId,
                GoogleMailAccount = request.GoogleMailAccount,
                Product = request.Product,
                Secret = request.Secret,
                UserId = user.Id,
                Active = true
            };

            await context.Credentials.AddAsync(credential);
            await context.SaveChangesAsync();

            return Ok(new Result());
        }

        [HttpGet]
        [Route("{LefebvreCredential}/[action]/Product/{product}")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<string>> GetAuthorizationLink(string LefebvreCredential, GoogleProduct product)
        {
            User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.LefebvreCredential == LefebvreCredential);

            if(user == null)
                return NoContent();

            if(user.Credentials == null)
                return NoContent();

            Credential credential = user.Credentials.SingleOrDefault(x => x.Product == product && x.Active == true);

            if(credential == null)
                return NoContent();

            
            StringBuilder _scopes = new StringBuilder();


            List<Scope> scopes = await context.Scopes.Where(x => x.Product == product).ToListAsync();

            if(scopes == null)
                return NoContent();

            for (int i = 0; i < scopes.Count - 1; i++)
            {
                if(i != 0)
                {
                    _scopes.Append(" ");
                }
                _scopes.Append(scopes[i].Url);
            }

            string url = "https://accounts.google.com/o/oauth2/v2/auth?";    
            url += "access_type=offline";
            url += "&response_type=code";
            url += "&client_id=";
            url += credential.ClientId;
            url += "&state=";
            url += user.Id;
            url += "&redirect_uri=";
            url += configuration["RedirectSuccessDriveUrl"];
            url += "/success";
            url += $"&scope={_scopes.ToString()}";
            url += "&include_granted_scopes=true";
            
            return Ok(new Result<string>(url));

        }


    }
}