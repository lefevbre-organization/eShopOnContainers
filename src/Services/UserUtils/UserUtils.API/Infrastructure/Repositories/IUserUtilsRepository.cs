using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Repositories
{
    public interface IUserUtilsRepository
    {
        Task<Result<bool>> RemoveByPassAsync(ByPassModel byPass);

        Task<Result<ByPassModel>> GetByPassAsync(string nameService);

        Task<Result<ByPassModel>> PostByPassAsync(ByPassModel byPass);
    }
}