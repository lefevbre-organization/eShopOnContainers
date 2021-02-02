using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class AuthRepository: BaseClass<AuthRepository>, IAuthRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public AuthRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<AuthRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }

        public async Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "")
        {
            Result<bool> result = new Result<bool>();

            try
            {
                if (error != "")
                {
                    TraceError(result.errors, new GoogleAccountDomainException($"Autorization Error {error}"), "GA02", "SQLLITE");
                }

                User user = await context.Users.Include(x => x.Credentials).FirstOrDefaultAsync(x => x.Id == Guid.Parse(UserId));

                if (user == null)
                {
                    TraceInfo(result.infos, "no encuentro ningún credencial con esos datos", "GA01");
                    return result;
                }

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == GoogleProduct.Drive && x.Active == true);

                if (credential == null)
                    return result;

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
                googletoken.Append(_settings.Value.RedirectSuccessDriveUrl);

                using (HttpClient client = new HttpClient())
                {
                    var response = await client.PostAsync(googletoken.ToString(), null);

                    if (response.IsSuccessStatusCode)
                    {
                        var token = JsonConvert.DeserializeObject<OAuth2TokenModel>(await response.Content.ReadAsStringAsync());

                        credential.Access_Token = token.access_token;
                        credential.Refresh_Token = token.refresh_token;
                        credential.Scope = token.scope;
                        credential.Token_Type = token.token_type;

                        context.Credentials.Update(credential);
                        await context.SaveChangesAsync();

                        result.data = true;
                    }
                    else
                    {
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA02","SQLLITE");
            }

            return result;            
        }

    }
}
