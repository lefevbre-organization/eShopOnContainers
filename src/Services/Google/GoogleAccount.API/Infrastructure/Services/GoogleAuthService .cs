using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{


    /// Aquí va toda la logica 
    
    public class GoogleAuthService : BaseClass<GoogleAccountService>, IGoogleAuthService
    {
        public readonly IGoogleAccountRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly ApplicationDbContext context;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<GoogleDriveSettings> _settings;

        public GoogleAuthService(
                IOptions<GoogleDriveSettings> settings
                , IGoogleAccountRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<GoogleAccountService> logger
                , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repo = databaseRepository ?? throw new ArgumentNullException(nameof(databaseRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            this.context = context;
            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }
        

        public async Task<Result<UserGoogleAccount>> GetUserAsync(string idNavisionUser, short idApp)
            => await _repo.GetUserAsync(idNavisionUser, idApp);

        public async Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user)
            => await _repo.PostUserAsync(user);

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

        public async Task<Result<string>> SaveCode(string state, string code)
        {
            var result = new Result<string>();
            try
            {
                User user = await context.Users.Include(x => x.Credentials).FirstOrDefaultAsync(x => x.Id == Guid.Parse(state));

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

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
                googletoken.Append("");

                using (var client2 = new HttpClient())
                {

                }
               

                HttpClient client = new HttpClient();

                var response = await client.PostAsync(GetGoogleTokenUrl(credential.ClientId, credential.Secret, credential.Code, configuration["RedirectSuccessDriveUrl"]), null);

                if (response.IsSuccessStatusCode)
                {
                    var token = JsonConvert.DeserializeObject<OAuth2TokenModel>(await response.Content.ReadAsStringAsync());
                    //var token = await response.Content.ReadFromJsonAsync<OAuth2TokenModel>();

                    credential.Access_Token = token.access_token;
                    credential.Refresh_Token = token.refresh_token;
                    credential.Scope = token.scope;
                    credential.Token_Type = token.token_type;

                }
                else
                {
                    
                }
            }
            catch (Exception ex)
            {

                TraceError(result.errors,
                           new GoogleAccountDomainException("Error en la verificación", ex),
                           Codes.MailAccounts.UserCreate,
                           Codes.Areas.Mongo);
            }

            return result;

        }
    }
}