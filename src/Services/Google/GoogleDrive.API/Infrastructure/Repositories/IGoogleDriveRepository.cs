using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using Models;

    public interface IGoogleDriveRepository
    {
        Task<Result<string>> GetToken(string LefebvreCredential);
    }
}