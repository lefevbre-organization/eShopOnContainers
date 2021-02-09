using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using Model;

    public interface IGoogleDriveRepository
    {
        Task<Result<string>> GetToken(string LefebvreCredential);
    }
}