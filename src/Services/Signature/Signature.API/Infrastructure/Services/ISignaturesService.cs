namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    #region Using
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    #endregion Using

    public interface ISignaturesService
    {
        Task<Result<UserSignatures>> GetUser(string user);

        Task<Result<UserSignatures>> Create(UserSignatures signature);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertSignature(string user, Signature signatureIn);

        Task<Result<bool>> DeleteSignature(string id);

        Task<Result<int>> AddAvailableSignatures(string user, int num);

        Task<Result<int>> GetAvailableSignatures(string user);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        //Task<Result<bool>> GetSignature(string signatureId, string documentId, string eventType);

        //Task<Result<int>> DecAvailableSignatures(string user);

        Task<RestSharp.IRestResponse> checkAvailableSignatures(string user, int nDocuments);

        #region Events
        Task<Result<bool>> SaveEvent(SignEventInfo info);

        Task<Result<List<SignEventInfo>>> GetEvents(string signatureId);

        Task<Result<bool>> ProcessEvent(string signatureId, string documentId, string eventType);

        Task<Result<bool>> ResetUserBrandings(string user);
        #endregion

    }
}