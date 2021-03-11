using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

    public interface IRevokeRepository
    {
        Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential, GoogleProduct idProduct = GoogleProduct.Drive);
    }
}