﻿namespace Signature.API.Infrastructure.Services
{
    #region Using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System;
    #endregion Using

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