using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public interface IGoogleAccountRepository
    {

        Task<Result<UserGoogleAccount>> GetUserAsync(string idUser, short idApp);

        Task<Result<UserGoogleAccount>> PostUserAsync(UserGoogleAccount user);

    }
}