using Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.Infrastructure.Repositories
{
    public interface IGoogleDriveRepository
    {
      
        Task<Result<UserGoogleDrive>> GetUserAsync(string idUser, short idApp);

        Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user);

    }
}