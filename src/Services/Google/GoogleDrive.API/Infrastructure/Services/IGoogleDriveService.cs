using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    using Model;

    public interface IGoogleDriveService
    {
        Task<Result<UserGoogleDrive>> GetUserAsync(string idNavisionUser, short idApp);

        Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user);
    }
}