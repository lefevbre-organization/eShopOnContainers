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
using System.Net.Http.Headers;

namespace Lefebvre.Server.Controllers
{

    
    
    [ApiController]
    [Route("[controller]")]
    public class GoogleDriveController : ControllerBase
    {

        private readonly ApplicationDbContext context;

        public GoogleDriveController(ApplicationDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<DriveFile>>> GetAction([FromQuery] string UserId)
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

            DriveCollection collection = new DriveCollection();

            cliente.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token.Token);
            var driveresponse = await cliente.GetAsync("https://www.googleapis.com/drive/v3/files");

            if(driveresponse.StatusCode == System.Net.HttpStatusCode.OK)
            {
                collection = JsonConvert.DeserializeObject<DriveCollection>(await driveresponse.Content.ReadAsStringAsync());
            }

            return Ok(collection.files);

        }

    }
}