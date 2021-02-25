using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public interface IRevokeService
    {
        Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential);
    }
}