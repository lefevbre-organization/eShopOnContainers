using Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Services
{
    public interface IGoogleDriveService
    {
        Task<Result<UserGoogleDrive>> GetUserAsync(string idNavisionUser, short idApp);

        Task<Result<UserGoogleDrive>> PostUserAsync(UserGoogleDrive user);

    }
}