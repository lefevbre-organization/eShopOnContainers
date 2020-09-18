namespace CertifiedEmail.API.Infrastructure.Services
{
    #region Using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System;
    #endregion Using

    public interface ISignaturesService
    {
        Task<Result<UserSignatures>> GetEmails(string user);

        Task<Result<UserSignatures>> CreateEmail(UserSignatures signature);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertEmail(string user, Signature signatureIn);

        Task<Result<bool>> DeleteEmail(string id);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        #region Events
        Task<Result<bool>> SaveEvent(SignEventInfo info);

        Task<Result<List<SignEventInfo>>> GetEvents(string signatureId);

        Task<Result<bool>> ProcessEvent(string signatureId, string documentId, string eventType);

        Task<Result<bool>> ResetUserBrandings(string user);
        #endregion
    }
}