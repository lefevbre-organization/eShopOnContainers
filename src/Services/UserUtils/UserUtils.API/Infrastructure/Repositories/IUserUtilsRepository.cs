using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Repositories
{
    public interface IUserUtilsRepository
    {
        Task<Result<List<ByPassModel>>> GetListByPassAsync();

        Task<Result<UserUtilsModel>> GetUserAsync(string idNavision);

        Task<Result<UserUtilsModel>> PostUserAsync(UserUtilsModel user);

        Task<Result<bool>> RemoveUserAsync(string idNavision);
    }
}