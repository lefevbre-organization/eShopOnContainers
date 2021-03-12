using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace GrpcUserutils
{
    public class UserUtilsGrpcService : BaseClass<UserUtilsGrpcService> //, IUserUtilsService
    {
        public readonly IUserUtilsService _svc;

        public UserUtilsGrpcService(
                 ILogger<UserUtilsGrpcService> logger
                , IUserUtilsService service
            ) : base(logger)
        { }

        async Task<Result<string>> GetEncodeUserAsync(string idNavisionUser) 
            => await _svc.GetEncodeUserAsync(idNavisionUser);

        async Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser) 
            => await _svc.GetDecodeUserAsync(idEncodeNavisionUser);

        async Task<Result<List<LefebvreApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives) 
            => await _svc.GetUserUtilsAsync(idNavisionUser, onlyActives);

        async Task<Result<ServiceComUser>> GetUserDataWithLoginAsync(string login, string pass) 
            => await _svc.GetUserDataWithLoginAsync(login, pass);

        async Task<Result<ServiceComUser>> GetUserDataWithEntryAsync(string idNavisionUser) 
            => await _svc.GetUserDataWithEntryAsync(idNavisionUser);

        async Task<Result<ServiceComArea[]>> GetAreasByUserAsync(string idNavisionUser) 
            => await _svc.GetAreasByUserAsync(idNavisionUser);


        async Task<Result<UserUtilsModel>> PostUserAsync(UserUtilsModel user)
            => await _svc.PostUserAsync(user);

        async Task<Result<UserUtilsModel>> GetUserAsync(string idNavision)
            => await _svc.GetUserAsync(idNavision);

        async Task<Result<bool>> RemoveUserAsync(string idNavision)
            => await _svc.RemoveUserAsync(idNavision);


        async Task<Result<string>> GetUserUtilsActualToServiceAsync(string idUser, string nameService) 
            => await _svc.GetUserUtilsActualToServiceAsync(idUser, nameService);

        async Task<Result<string>> GetUserUtilsActualToSignatureAsync(string idUser) 
            => await _svc.GetUserUtilsActualToSignatureAsync(idUser);

        async Task<Result<TokenData>> VadidateTokenAsync(TokenData tokenRequest, bool validateCaducity = true) 
            => await _svc.VadidateTokenAsync(tokenRequest, validateCaducity);

        async Task<Result<TokenData>> GetGenericTokenAsync(TokenRequest tokenRequest, bool addTerminatorToToken) 
            => await _svc.GetGenericTokenAsync(tokenRequest, addTerminatorToToken);

        async Task<Result<LexUser>> GetLexonGenericAsync(TokenModelView token, short idApp, bool addTerminatorToToken) 
            => await _svc.GetLexonGenericAsync(token, idApp, addTerminatorToToken);


        async Task<Result<bool>> FirmCheckAsync(string idClient, string numDocs) 
            => await _svc.FirmCheckAsync(idClient, numDocs);

        async Task<Result<string>> FirmCheckAvailableAsync(string idClient) 
            => await _svc.FirmCheckAvailableAsync(idClient);

        async Task<Result<bool>> FirmUseAsync(string idClient, string idUser, string numDocs) 
            => await _svc.FirmUseAsync(idClient, idUser, numDocs);

    }
}