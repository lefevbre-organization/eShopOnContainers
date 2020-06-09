namespace Signature.API.Infrastructure.Services
{
    #region Using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    #endregion Using

    public interface IBrandingsService
    {
        Task<Result<BaseBrandings>> GetTemplateBranding(string app);
        Task<Result<BaseBrandings>> GetDefaultBranding(string app);
        Task<Result<BaseBrandings>> GetUserBranding(string app, string id);
        Task<Result<BaseBrandings>> CreateBranding(BaseBrandings branding);
        //Task<Result<UserBrandings>> AddOrUpdateUserBranding(string app, string id);

        Task<Result<BaseBrandings>> CreateBrandingTest(BaseBrandings branding);
        Task<Result<BaseBrandings>> GetTemplateBrandingTest(string app);

    }
}
