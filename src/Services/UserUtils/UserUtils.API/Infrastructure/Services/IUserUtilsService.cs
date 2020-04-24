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
        Task<Result<TokenData>> GetUserFromLoginAsync(int? idApp, string login, string password, bool addTerminatorToToken);
        Task<Result<TokenData>> GetLexonUserSimpleAsync(string idClienteNavision, bool addTerminatorToToken);
        Task<Result<TokenData>> GetLexonNewMailAsync(TokenRequestNewMail tokenRequest, bool addTerminatorToToken);
        Task<Result<TokenData>> GetLexonOpenMailAsync(TokenRequestOpenMail tokenRequest, bool addTerminatorToToken);
        Task<Result<TokenData>> GetLexonUserDbAsync(TokenRequestDataBase tokenRequest, bool addTerminatorToToken);
        Task<Result<ServiceComUser>> GetUserDataWithLoginAsync(string login, string pass);
        Task<Result<ServiceComUser>> GetUserDataWithEntryAsync(string idNavisionUser);
    }
}