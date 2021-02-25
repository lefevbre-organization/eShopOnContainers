using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Model;
    public interface IScopeService
    {
        Task<Result<GoogleAccountScope>> CreateScope(GoogleAccountScope scope);
        Task<Result<bool>> DeleteScope(string ScopeId);
        Task<Result<List<GoogleAccountScope>>> GetScopes(GoogleProduct product);
    }
}