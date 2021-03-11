using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

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
