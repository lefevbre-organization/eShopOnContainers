using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public interface ICredentialRepository
    {
        Task<Result<UserCredentialResponse>> CreateCredential(string LefebvreCredential, CreateCredentialRequest request);
        Task<Result<UserResponse>> CreateUserCredential(string LefebvreCredential);
        Task<Result<Credential>> GetCredentialUserForProduct(string LefebvreCredential, GoogleProduct product);
        Task<Result<List<UserCredentialResponse>>> GetCredentials(string LefebvreCredential);
        Task<Result<string>> GetToken(string LefebvreCredential, GoogleProduct Product);
        Task<Result<UserResponse>> GetUserCredential(string LefebvreCredential);
    }
}