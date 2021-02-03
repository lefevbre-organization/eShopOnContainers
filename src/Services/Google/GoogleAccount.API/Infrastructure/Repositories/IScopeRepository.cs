using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public interface IScopeRepository
    {
        Task<Result<GoogleAccountScope>> CreateScope(GoogleAccountScope scope);
        Task<Result<bool>> DeleteScope(string ScopeId);
        Task<Result<List<GoogleAccountScope>>> GetScopes(GoogleProduct product);
    }
}