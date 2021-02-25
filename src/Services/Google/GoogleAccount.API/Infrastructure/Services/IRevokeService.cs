using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    public interface IRevokeService
    {
        Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential);
    }
}