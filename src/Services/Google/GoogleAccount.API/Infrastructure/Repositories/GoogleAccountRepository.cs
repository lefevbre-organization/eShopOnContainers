using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.IntegrationsEvents.Events;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class GoogleAccountRepository : BaseClass<GoogleAccountRepository>, IGoogleAccountRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public GoogleAccountRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<GoogleAccountRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }

        public async Task<Credential> GetCredentialUserAsync(string userId, GoogleProduct drive, bool active)
        {
            await Task.Delay(1);
            return new Credential();
        }

        public async Task<User> GetUserAsync(string LefebvreCredential)
        {
            await Task.Delay(1);
            return new User();
        }

        public async Task<bool> RevokeCredentialAsync(string UserId, string CredentialId)
        {
            await Task.Delay(1);
            return true;
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


                using (HttpClient client = new HttpClient())
                {

                    var response = await client.PostAsync(GetGoogleTokenUrl(credential.ClientId, credential.Secret, credential.Code, _settings.Value.RedirectSuccessDriveUrl), null);

                    if (response.IsSuccessStatusCode)
                    {
                        var token = JsonConvert.DeserializeObject<OAuth2TokenModel>(await response.Content.ReadAsStringAsync());
                        credential.Access_Token = token.access_token;
                        credential.Refresh_Token = token.refresh_token;
                        credential.Scope = token.scope;
                        credential.Token_Type = token.token_type;

                    }
                    else
                    {

                    }

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







        //private async Task<Result<UserGoogleAccount>> GetUserCommonAsync(FilterDefinition<UserGoogleAccount> filter)
        //{
        //    var result = new Result<UserGoogleAccount>();
        //    try
        //    {
        //        result.data = await _context.UserGoogleAccounts.Find(filter).FirstOrDefaultAsync();

        //        if (result.data == null)
        //            TraceError(result.errors, new GoogleAccountDomainException($"No se encuentra ningún usuario"), Codes.GoogleDrive.Get, Codes.Areas.Mongo);
        //    }
        //    catch (Exception ex)
        //    {
        //        TraceError(result.errors,
        //                   new GoogleAccountDomainException($"Error when get users", ex),
        //                   Codes.GoogleDrive.Get,
        //                   Codes.Areas.Mongo
        //                   );
        //    }
        //    return result;
        //}





    }
}