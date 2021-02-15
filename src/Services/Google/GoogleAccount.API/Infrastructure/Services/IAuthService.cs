using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using Model;
    public interface IAuthService
    {
        Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "");
    }
}