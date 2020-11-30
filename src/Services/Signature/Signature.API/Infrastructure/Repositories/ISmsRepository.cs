namespace Signature.API.Infrastructure.Repositories
{
    #region using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using MongoDB.Bson;
    #endregion

    public interface ISmsRepository
    {
        Task<Result<UserSms>> GetUser(string user);

        Task<Result<List<UserSms>>> GetAll();

        Task<Result<UserSms>> Create(UserSms sms);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertSms(string user, CertifiedSms smsIn);

        Task<Result<UserSms>> GetSms(string smsId);

        Task<Result<bool>> SaveEvent(SmsEventInfo smsInfo);

        Task<Result<List<SmsEventInfo>>> GetEvents(string certificateId);
    }
}
