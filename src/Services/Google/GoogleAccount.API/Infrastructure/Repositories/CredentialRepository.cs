using System;
using System.Collections.Generic;
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
using MongoDB.Driver;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class CredentialRepository : BaseClass<CredentialRepository>, ICredentialRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;

        public CredentialRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<CredentialRepository> logger
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleAccountContext(settings, eventBus);
        }


        private async Task<GoogleAccountUser> GetUser(string LefebvreCredential)
        {
            return await _context.UserGoogleAccounts.Find(GetFilterUser(LefebvreCredential)).FirstOrDefaultAsync();
        }

        private async Task<List<GoogleAccountScope>> GetScopes(GoogleProduct product)
        {
            return await _context.ScopeGoogleAccounts.Find(GetFilterScope(product)).ToListAsync();
        }

        private static FilterDefinition<GoogleAccountUser> GetFilterUser(string LefebvreCredential, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountUser>.Filter.And(
                Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential.ToUpperInvariant()),
                Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true));
            }

            return Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, LefebvreCredential.ToUpperInvariant());
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
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."));
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
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."));
                    return result;
                }

                if (user.Credentials == null)
                    return result;

                if (user.Credentials.Count() == 0)
                    return result;

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

        public async Task<Result<OAuth2TokenModel>> GetToken(string LefebvreCredential, GoogleProduct Product)
        {
            Result<OAuth2TokenModel> result = new Result<OAuth2TokenModel>();

            try
            {
                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("User not found."));
                    return result;
                }

                Credential credential = user.Credentials.SingleOrDefault(x => x.Product == Product);

                if (credential == null)
                    return result;

                if (credential.TokenExpire)
                {
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
                            result.data = JsonConvert.DeserializeObject<OAuth2TokenModel>(await refresh.Content.ReadAsStringAsync());
                            return result;
                        }
                        else
                        {
                            return result;
                        }
                    }
                }
                else
                {
                    result.data = new OAuth2TokenModel()
                    {
                        access_token = credential.Access_Token,
                        refresh_token = credential.Refresh_Token,
                        expires_in = credential.Duration,
                        scope = credential.Scope,
                        token_type = credential.Token_Type
                    };

                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;



        }
        public async Task<Result<UserResponse>> CreateUserCredential(string LefebvreCredential)
        {
            Result<UserResponse> result = new Result<UserResponse>();

            try
            {

                GoogleAccountUser user = await GetUser(LefebvreCredential);

                if (user == null)
                {
                    user.LefebvreCredential = LefebvreCredential;
                    user.Credentials = new List<Credential>();

                    // TODO COMO GUARDAR DATOS
                }

                result.data = new UserResponse()
                {
                    Id = user.Id,
                    LefebvreCredential = user.LefebvreCredential
                };
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
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

                Credential _credential = user.Credentials.SingleOrDefault
                (
                    x => x.GoogleMailAccount == request.GoogleMailAccount &&
                    x.Product == request.Product &&
                    x.Active == true
                );

                if (_credential != null)
                {
                    TraceError(result.errors, new GoogleAccountDomainException("The credential already exists."));
                    return result;
                }

                Credential credential = new Credential()
                {
                    Id = Guid.NewGuid(),
                    ClientId = request.ClientId,
                    GoogleMailAccount = request.GoogleMailAccount,
                    Product = request.Product,
                    Secret = request.Secret,
                    UserId = user.Id,
                    Active = true
                };

                user.Credentials.Add(credential);

                // TODO Guardar Registro

                TraceInfo(result.infos, "Credential create");

                result.data = new UserCredentialResponse()
                {
                    ClientId = credential.ClientId,
                    GoogleMailAccount = credential.GoogleMailAccount,
                    Product = credential.Product,
                    Secret = credential.Secret
                };

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
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
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex), "GA01");
            }

            return result;
        }



    }
}