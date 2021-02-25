﻿using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

    public interface IEmailsRepository
    {
        Task<Result<UserEmails>> GetUser(string user);

        Task<Result<List<UserEmails>>> GetAll();

        Task<Result<UserEmails>> Create(UserEmails email);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertEmail(string user, CertifiedEmail emailIn);

        Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn);

        Task<Result<UserEmails>> GetEmail(string emailId);

        Task<Result<bool>> ResetUserBrandings(string user);

        Task<Result<bool>> SaveEvent(EmailEventInfo eventInfo);

        Task<Result<List<EmailEventInfo>>> GetEvents(string certificateId);
    }
}
