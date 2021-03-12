﻿using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Exceptions;
    using Infrastructure.Repositories;
    using Model;
    public class AuthService : BaseClass<AuthService>, IAuthService
    {
        private readonly IOptions<GoogleAccountSettings> settings;
        private readonly IAuthRepository repository;
        private readonly IEventBus eventBus;
        private readonly IHttpClientFactory clientFactory;

        public AuthService(
            IOptions<GoogleAccountSettings> settings
            , IAuthRepository repository
            , IEventBus eventBus
            , IHttpClientFactory clientFactory
            , ILogger<AuthService> logger
            ) : base(logger)
        {
            this.settings = settings;
            this.repository = repository;
            this.eventBus = eventBus;
            this.clientFactory = clientFactory;
        }

        public async Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "")
        {
            Result<bool> result = new Result<bool>();

            var resultCredential = await repository.GetGredentials(product, UserId, code, scope, error);

            StringBuilder googletoken = new StringBuilder();

            googletoken.Append("https://oauth2.googleapis.com/token?");
            googletoken.Append("client_id=");
            googletoken.Append(resultCredential.data.ClientId);
            googletoken.Append("&client_secret=");
            googletoken.Append(resultCredential.data.Secret);
            googletoken.Append("&code=");
            googletoken.Append(resultCredential.data.Code);
            googletoken.Append("&grant_type=authorization_code");
            googletoken.Append("&redirect_uri=");
            googletoken.Append($"{settings.Value.RedirectSuccessDriveUrl}/success");

            using (HttpClient client = new HttpClient())
            {
                var response = await client.PostAsync(googletoken.ToString(), null);

                if (response.IsSuccessStatusCode)
                {
                    var token = JsonConvert.DeserializeObject<OAuth2TokenModel>(await response.Content.ReadAsStringAsync());

                    resultCredential.data.Access_Token = token.access_token;
                    resultCredential.data.Refresh_Token = token.refresh_token;
                    resultCredential.data.TokenCreate = DateTime.Now;
                    resultCredential.data.Duration = token.expires_in;
                    resultCredential.data.Scope = token.scope;
                    resultCredential.data.Token_Type = token.token_type;

                    result = await repository.UpdateCredentialsSuccess(resultCredential.data, UserId);
                }
                else
                {
                    TraceError(result.errors, new GoogleAccountDomainException($"Error la llamda a la autorhización de Google, StatusCode: {response.StatusCode}"), Codes.GoogleAccount.GoogleAuthorization, Codes.Areas.Google);
                    TraceError(result.errors, new GoogleAccountDomainException($"{googletoken.ToString()}"), Codes.GoogleAccount.GoogleAuthorization, Codes.Areas.Google );
                }
            }
            return result;
        }
    }
}