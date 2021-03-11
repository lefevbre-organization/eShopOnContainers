using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    using BuidingBlocks.Lefebvre.Models;
    using Model;
    public interface IAuthRepository
    {
        Task<Result<Credential>> GetGredentials(GoogleProduct product, string UserId, string code, string scope, string error = "");
        Task<Result<bool>> UpdateCredentialsSuccess(Credential data, string GooogleAccountUserId);
    }
}