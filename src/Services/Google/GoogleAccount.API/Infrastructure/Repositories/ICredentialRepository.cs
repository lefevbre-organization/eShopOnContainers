using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    using Model;
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