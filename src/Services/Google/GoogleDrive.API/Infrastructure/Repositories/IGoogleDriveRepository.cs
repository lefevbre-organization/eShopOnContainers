using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using BuidingBlocks.Lefebvre.Models;
   
    public interface IGoogleDriveRepository
    {
        Task<Result<string>> GetToken(string LefebvreCredential);
    }
}