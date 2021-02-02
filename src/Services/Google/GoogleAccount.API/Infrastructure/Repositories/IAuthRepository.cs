using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public interface IAuthRepository
    {
        //Task<Result<bool>> Success(GoogleProduct product, string UserId, string code, string scope, string error = "");
        Task<Result<Credential>> GetGredentials(GoogleProduct product, string UserId, string code, string scope, string error = "");
        Task<Result<bool>> UpdateCredentialsSuccess(Credential data);
    }
}