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
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace Lefebvre.Server.Controllers
{
    
    [ApiController]
    [Route("[controller]")]
    public class TokenController : ControllerBase
    {
        private readonly ApplicationDbContext context;

        public TokenController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet(Name = "GetToken")]
        [Route("[action]")]
        public async Task<ActionResult<GoogleToken>> GetToken([FromQuery] string UserId)
        {
            return Ok(await context.Tokens.Where(x => x.UserId == UserId).SingleOrDefaultAsync());
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<ActionResult> CreateToken([FromBody] GoogleToken token)
        {
            GoogleToken _token = await context.Tokens.Where(x => x.UserId == token.UserId).SingleOrDefaultAsync();

            if(_token != null)
            {
                return BadRequest("Ya Existe un Secreto para este usuario");
            }

            token.TokenReadOnly = true;
            await context.Tokens.AddAsync(token);
            await context.SaveChangesAsync();

            return Ok(token);
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult> RefreshToken([FromQuery] string UserId)
        {
            GoogleToken _token = await context.Tokens.Where(x => x.UserId == UserId).SingleOrDefaultAsync();
            GoogleTokenRequest tokenRequest = new GoogleTokenRequest(){
                refresh_token = _token.TokenRefresh
            };

            HttpClient cliente = new HttpClient();
            var content = new StringContent(JsonConvert.SerializeObject(tokenRequest), Encoding.UTF8, "application/json");
            var googleresponse = await cliente.PostAsync("https://developers.google.com/oauthplayground/refreshAccessToken", content);

            if(googleresponse.StatusCode == System.Net.HttpStatusCode.OK)
            {
                GoogleTokenResponse tokenResponse = JsonConvert.DeserializeObject<GoogleTokenResponse>(await googleresponse.Content.ReadAsStringAsync());
                _token.Token = tokenResponse.access_token;
                context.Tokens.Update(_token);
                await context.SaveChangesAsync();
            }

            return Ok(_token.Token);

        }

    }
}