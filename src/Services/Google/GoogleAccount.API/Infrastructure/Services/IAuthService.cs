using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;
    public interface IAuthService
    {
        Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "");
    }
}