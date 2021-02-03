﻿using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public interface ICredentialService
    {
        Task<Result<UserCredentialResponse>> CreateCredential(string LefebvreCredential, CreateCredentialRequest request);
        Task<Result<UserResponse>> CreateUserCredential(string LefebvreCredential);
        Task<Result<string>> GetAuthorizationLink(string LefebvreCredential, GoogleProduct product);
        Task<Result<List<UserCredentialResponse>>> GetCredentials(string LefebvreCredential);
        Task<Result<OAuth2TokenModel>> GetToken(string LefebvreCredential, GoogleProduct Product);
        Task<Result<UserResponse>> GetUserCredential(string LefebvreCredential);
    }
}