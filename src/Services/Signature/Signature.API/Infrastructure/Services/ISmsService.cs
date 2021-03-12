using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

    public interface ISmsService
    {
        Task<Result<UserSms>> GetSms(string user);

        Task<Result<List<UserSms>>> GetAll();

        Task<Result<UserSms>> CreateSms(UserSms sms);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertSms(string user, CertifiedSms smsIn);

        #region Events
        Task<Result<bool>> SaveEvent(SmsEventInfo info);

        Task<Result<List<SmsEventInfo>>> GetEvents(string certificateId);

        Task<Result<bool>> ProcessEvent(string certificateId, string eventType);

        #endregion
    }
}