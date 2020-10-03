﻿namespace Signature.API.Infrastructure.Repositories
{
    #region using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using MongoDB.Bson;
    #endregion

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
    }
}