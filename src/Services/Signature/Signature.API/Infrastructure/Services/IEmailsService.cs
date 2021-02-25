namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    #region Using
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    #endregion Using

    public interface IEmailsService
    {
        Task<Result<UserEmails>> GetEmails(string user);

        Task<Result<List<UserEmails>>> GetAll();

        Task<Result<UserEmails>> CreateEmail(UserEmails signature);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertEmail(string user, CertifiedEmail signatureIn);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        Task<Result<bool>> ResetUserBrandings(string user);
        #region Events
        Task<Result<bool>> SaveEvent(EmailEventInfo info);

        Task<Result<List<EmailEventInfo>>> GetEvents(string certificateId);

        Task<Result<bool>> ProcessEvent(string certificateId, string eventType);

        #endregion
    }
}