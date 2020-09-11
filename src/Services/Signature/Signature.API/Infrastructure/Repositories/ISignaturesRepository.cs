namespace Signature.API.Infrastructure.Repositories
{
    #region using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using MongoDB.Bson;
    #endregion

    public interface ISignaturesRepository
    {
        Task<Result<UserSignatures>> GetUser(string user);

        Task<Result<UserSignatures>> Create(UserSignatures signature);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertSignature(string user, Signature signatureIn);

        Task<Result<bool>> DeleteSignature(string id);

        Task<Result<int>> AddAvailableSignatures(string user, int num);

        Task<Result<int>> GetAvailableSignatures(string user);

        //Task<Result<int>> DecAvailableSignatures(string user);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        Task<Result<UserSignatures>> GetSignature(string signatureId);

        Task<Result<bool>> ResetUserBrandings(string user);

        #region Events
        Task<Result<bool>> SaveEvent(SignEventInfo eventInfo);
        Task<Result<List<SignEventInfo>>> GetEvents(string signatureId);
        #endregion

    }
}