using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public interface IGoogleAuthService
    {
        Task<Result<UserGoogleAccount>> GetUserAsync(string idNavisionUser, short idApp);

        Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user);
        Task<Result<string>> SaveCode(string state, string code);
    }
}