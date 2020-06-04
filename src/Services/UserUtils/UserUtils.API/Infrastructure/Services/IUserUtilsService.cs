using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services
{
    public interface IUserUtilsService
    {
        Task<Result<string>> GetEncodeUserAsync(string idNavisionUser);

        Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser);

        Task<Result<List<LexApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives);

        //Task<Result<TokenData>> GetTokenAsync(TokenModelBase tokenRequest, bool addTerminatorToToken);

        Task<Result<TokenData>> VadidateTokenAsync(TokenData tokenRequest);

        Task<Result<ServiceComUser>> GetUserDataWithLoginAsync(string login, string pass);

        Task<Result<ServiceComUser>> GetUserDataWithEntryAsync(string idNavisionUser);
        Task<Result<TokenData>> GetGenericTokenAsync(TokenRequest tokenRequest, short idApp , bool addTerminatorToToken = true);

        Task<Result<LexUser>> GetLexonGenericAsync(TokenModelView tokenRequest, short idApp ,  bool addTerminatorToToken = true);
        Task<Result<TokenData>> GetUserFromLoginAsync(int? idApp, string login, string password, bool addTerminatorToToken);

        Task<Result<ServiceComArea[]>> GetAreasByUserAsync(string idNavisionUser);

        Task<Result<UserUtilsModel>> PostUserAsync(UserUtilsModel user);

        Task<Result<UserUtilsModel>> GetUserAsync(string nameService);

        Task<Result<bool>> RemoveUserAsync(string idNavision);

        Task<Result<string>> GetUserUtilsActualToServiceAsync(string idUser, string nameService);
    }
}