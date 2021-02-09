using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class CredentialRepository : BaseClass<CredentialRepository>, ICredentialRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly IAuthRepository repo;

        public CredentialRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<CredentialRepository> logger
            , IAuthRepository repo
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.repo = repo;
            _context = new GoogleAccountContext(settings, eventBus);
        }


        private async Task<GoogleAccountUser> GetUser(string LefebvreCredential)
        {
            return await _context.UserGoogleAccounts.Find(GetFilterUser(LefebvreCredential)).FirstOrDefaultAsync();
        }

        private static FilterDefinition<GoogleAccountUser> GetFilterUser(string LefebvreCredential, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountUser>.Filter.And(
                Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential.ToUpperInvariant()),
                Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true));
            }

            return Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential.ToUpperInvariant());
        }

        private static FilterDefinition<GoogleAccountScope> GetFilterScope(GoogleProduct product, bool onlyValid = true)
        {
            if(onlyValid)
            {
                return Builders<GoogleAccountScope>.Filter.And(
                Builders<GoogleAccountScope>.Filter.Eq(u => u.Product, product),
                Builders<GoogleAccountScope>.Filter.Eq(u => u.state, true));
                    
            }
            return Builders<GoogleAccountScope>.Filter.Eq(u => u.Product, product);
        }


        public async Task<Result<UserResponse>> GetUserCredential(string LefebvreCredential)
        {

            Result<UserResponse> result = new Result<UserResponse>();

            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);
                if (user == null)
                { 
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."), Codes.GoogleAccount.Get, Codes.Areas.Mongo);
                    return result;
                }

                List<UserCredentialResponse> list = new List<UserCredentialResponse>();

                foreach (Credential credential in user.Credentials.Where(x => x.Active == true))
                {
                    list.Add(new UserCredentialResponse()
                    {
                        ClientId = credential.ClientId,
                        GoogleMailAccount = credential.GoogleMailAccount,
                        Product = credential.Product,
                        Secret = credential.Secret
                    });
                }

                TraceInfo(result.infos, $"Return {list.Count} credentials.");

                result.data = new UserResponse()
                {
                    Id = user.Id,
                    LefebvreCredential = user.LefebvreCredential,
                    Credentials = list
                };
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

        public async Task<Result<List<UserCredentialResponse>>> GetCredentials(string LefebvreCredential)
        {

            Result<List<UserCredentialResponse>> result = new Result<List<UserCredentialResponse>>();

            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."), "GA04");
                    return result;
                }

                if (user.Credentials == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("El Usuario no tiene credenciales"), "GA04");
                    return result;
                }

                if (user.Credentials.Count() == 0)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("El usuario no tiene credenciales"), "GA04");
                    return result;
                }

                List<UserCredentialResponse> list = new List<UserCredentialResponse>();

                foreach (Credential credential in user.Credentials)
                {
                    list.Add(new UserCredentialResponse()
                    {
                        ClientId = credential.ClientId,
                        GoogleMailAccount = credential.GoogleMailAccount,
                        Product = credential.Product,
                        Secret = credential.Secret
                    });
                }

                result.data = list;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

        public async Task<Result<string>> GetToken(string LefebvreCredential, GoogleProduct Product)
        {
            Result<string> result = new Result<string>();

            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."), "GA04");
                    return result;
                }

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == Product);

                if (credential == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("No existe una credencial para este usuario"), Codes.GoogleAccount.GetCredentials, Codes.Areas.Mongo);
                    return result;
                }

                
                if (DateTime.Now <= credential.TokenCreate.AddMilliseconds(credential.Duration))
                {

                    TraceInfo(result.infos, "token restablecido");

                    using (HttpClient Client = new HttpClient())
                    {
                        OAuth2RefreshToken request = new OAuth2RefreshToken()
                        {
                            client_id = credential.ClientId,
                            client_secret = credential.Secret,
                            refresh_token = credential.Refresh_Token,
                            grant_type = "refresh_token"
                        };

                        var refresh = await Client.PostAsync("https://oauth2.googleapis.com/token", new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json"));

                        if (refresh.IsSuccessStatusCode)
                        {
                            var token = JsonConvert.DeserializeObject<OAuth2TokenModel>(await refresh.Content.ReadAsStringAsync());

                            var resultupdate = await repo.UpdateCredentialsSuccess(credential, user.Id);

                            result.data = token.access_token;
                            return result;
                        }
                        else
                        {
                            TraceError(result.errors, new GoogleAccountDomainException("Error al pedir que refrescaran el token"), Codes.GoogleAccount.GoogleAuthorization, Codes.Areas.Google);

                            return result;
                        }
                    }
                }
                else
                {
                    result.data = credential.Access_Token;
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), Codes.GoogleAccount.Get, Codes.Areas.Mongo);
            }

            return result;
        }
        public async Task<Result<UserResponse>> CreateUserCredential(string LefebvreCredential)
        {
            Result<UserResponse> result = new Result<UserResponse>();
            Result<GoogleAccountUser> resultUser = new Result<GoogleAccountUser>();

            try
            {


                var _user = await GetUser(LefebvreCredential);
                if(_user != null)
                {
                    result.data = new UserResponse()
                    {
                        Id = _user.Id,
                        LefebvreCredential = _user.LefebvreCredential,
                        Credentials = new List<UserCredentialResponse>()
                    };

                    _user.Credentials.ForEach(x => {

                        result.data.Credentials.Add(new UserCredentialResponse() {
                             ClientId = x.ClientId,
                             GoogleMailAccount = x.GoogleMailAccount,
                             Product = x.Product,
                             Secret  = x.Secret
                        });

                    });
                    TraceInfo(result.infos, "Este usuario ya estaba registrado", Codes.GoogleAccount.GetCredentials);
                    return result;
                }


                var user = new GoogleAccountUser() {
                    LefebvreCredential = LefebvreCredential,
                    state = true,
                    Credentials = _user != null ? _user.Credentials : new List<Credential>()
                };

                
                var resultUpdate = await _context.UserGoogleAccounts.ReplaceOneAsync(
                    GetFilterUser(LefebvreCredential, false),
                    user, GetUpsertOptions());


                user.Id = ManageUpsert($"Don´t insert or modify the LefebvreCredential",
                     $"Se modifica el LefebvreCredential {LefebvreCredential}",
                     $"Se inserta el LefebvreCredential {LefebvreCredential}",
                     resultUser, resultUpdate, "GA07");

                AddResultTrace(resultUser, result);

                if (user != null)
                {
                    result.data = new UserResponse()
                    {
                        Id = user.Id,
                        LefebvreCredential = user.LefebvreCredential,
                    };

                    user.Credentials.ForEach(x => {

                        result.data.Credentials.Add(new UserCredentialResponse()
                        {
                            ClientId = x.ClientId,
                            GoogleMailAccount = x.GoogleMailAccount,
                            Product = x.Product,
                            Secret = x.Secret
                        });

                    });

                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA07");
            }

            return result;
        }

        public async Task<Result<UserCredentialResponse>> CreateCredential(string LefebvreCredential, CreateCredentialRequest request)
        {
            Result<UserCredentialResponse> result = new Result<UserCredentialResponse>();

            try
            {

                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."));
                    return result;
                }

                Credential _credential = user.Credentials?.SingleOrDefault
                (
                    x => x.GoogleMailAccount == request.GoogleMailAccount &&
                    x.Product == request.Product &&
                    x.Active == true
                );

                if (_credential != null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("The credential already exists."), "GA04");
                    return result;
                }

                var builder = Builders<GoogleAccountUser>.Filter;
                var filter = GetFilterUser(LefebvreCredential);
                var update = Builders<GoogleAccountUser>.Update
                    .AddToSet(x => x.Credentials, new Credential
                    {
                        Id = Guid.NewGuid(),
                        ClientId = request.ClientId,
                        GoogleMailAccount = request.GoogleMailAccount,
                        Product = request.Product,
                        Secret = request.Secret,
                        UserId = user.Id,
                        Active = true
                    });
                var updateResult = await _context.UserGoogleAccounts.UpdateOneAsync(filter, update);

               var ok = ManageUpdate($"Error -> Don´t changue the GoogleAccountUser {LefebvreCredential}", 
                             $"Add the credential for user {request.Product} to GoogleAccountuser {LefebvreCredential}",
                             result,
                             updateResult,
                             "GA05");

                if (ok){
                    TraceInfo(result.infos, "Credential create", "GA05");
                    result.data = new UserCredentialResponse()
                    {
                        ClientId = request.ClientId,
                        GoogleMailAccount = request.GoogleMailAccount,
                        Product = request.Product,
                        Secret = request.Secret
                    };
                }
                else
                {
                    TraceError(result.errors, new GoogleAccountDomainException("Don´t update GoogleAccountUser"), "GA05");

                }

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA05");
            }

            return result;
        }

        public async Task<Result<Credential>> GetCredentialUserForProduct(string LefebvreCredential, GoogleProduct product)
        {

            Result<Credential> result = new Result<Credential>();


            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."));
                    return result;
                }

                if (user.Credentials == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User does not have credentials"));
                    return result;
                }

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == product && x.Active == true);

                if (credential == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("Credential not found."));
                    return result;
                }          

                result.data = credential;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), Codes.GoogleAccount.Get, Codes.Areas.Mongo);
            }

            return result;
        }



    }
}