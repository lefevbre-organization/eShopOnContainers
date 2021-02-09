using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using Model;

    public interface IGoogleDriveRepository
    {
        Task<Result<UserGoogleDrive>> GetUserAsync(string idUser, short idApp);

        Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user);
    }
}