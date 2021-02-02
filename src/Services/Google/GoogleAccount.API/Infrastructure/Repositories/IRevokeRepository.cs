using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public interface IRevokeRepository
    {
        Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential);
    }
}