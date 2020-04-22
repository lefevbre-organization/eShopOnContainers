using UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace UserUtils.API.Infrastructure.Services
{
    public interface IUserUtilsService
    {
        Task<Result<string>> GetEncodeUserAsync(string idNavisionUser);
        Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser);
        Task<Result<List<LexApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives);
        Task<Result<TokenData>> GetTokenAsync(TokenModelBase tokenRequest, bool addTerminatorToToken);
        Task<Result<TokenData>> VadidateTokenAsync(TokenData tokenRequest);

    }
}