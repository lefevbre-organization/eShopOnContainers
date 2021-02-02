using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    public interface IScopeService
    {
        Task<Result<Scope>> CreateScope(Scope scope);
        Task<Result<bool>> DeleteScope(string ScopeId);
        Task<Result<List<Scope>>> GetScopes(GoogleProduct product);
    }
}