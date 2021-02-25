using System.Threading.Tasks;
namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

    public interface IBrandingsRepository
    {
        Task<Result<BaseBrandings>> GetTemplateBranding(string app);
        Task<Result<BaseBrandings>> GetDefaultBranding(string app);
        Task<Result<BaseBrandings>> GetUserBranding(string app, string id);

        Task<Result<BaseBrandings>> CreateBranding(BaseBrandings branding);
        //Task<Result<UserBrandings>> AddOrUpdateUserBranding(string app, string id);
        Task<Result<BaseBrandings>> CreateBrandingTest(BaseBrandings brandingIn);
        Task<Result<BaseBrandings>> GetTemplateBrandingTest(string app);

    }
}
