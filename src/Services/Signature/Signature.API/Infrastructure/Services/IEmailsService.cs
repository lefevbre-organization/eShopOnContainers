namespace Signature.API.Infrastructure.Services
{
    #region Using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System;
    #endregion Using

    public interface IEmailsService
    {
        Task<Result<UserEmails>> GetEmails(string user);

        Task<Result<UserEmails>> CreateEmail(UserEmails signature);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertEmail(string user, CertifiedEmail signatureIn);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        Task<Result<bool>> ResetUserBrandings(string user);
        #region Events
        //Task<Result<bool>> SaveEvent(SignEventInfo info);

        //Task<Result<List<SignEventInfo>>> GetEvents(string signatureId);

        //Task<Result<bool>> ProcessEvent(string signatureId, string documentId, string eventType);

        #endregion
    }
}