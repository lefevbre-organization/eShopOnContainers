using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Repositories;
    using Model;

    public class BrandingsService : IBrandingsService
    {
        public readonly IBrandingsRepository _brandingsRepository;
        private readonly IOptions<SignatureSettings> _settings;

        public BrandingsService(
                IOptions<SignatureSettings> settings
                , IBrandingsRepository brandingsRepository
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _brandingsRepository = brandingsRepository ?? throw new ArgumentNullException(nameof(brandingsRepository));
        }

        #region Signatures

        public async Task<Result<BaseBrandings>> GetTemplateBranding(string app)
        {
            return await _brandingsRepository.GetTemplateBranding(app);
        }

        public async Task<Result<BaseBrandings>> GetDefaultBranding(string app)
        {
            return await _brandingsRepository.GetDefaultBranding(app);
        }

        public async Task<Result<BaseBrandings>> GetUserBranding(string app, string id)
        {
            return await _brandingsRepository.GetUserBranding(app, id);
        }

        public async Task<Result<BaseBrandings>> CreateBranding(BaseBrandings branding)
        {
            return await _brandingsRepository.CreateBranding(branding);
        }

        public async Task<Result<BaseBrandings>> CreateBrandingTest(BaseBrandings branding)
        {
            return await _brandingsRepository.CreateBrandingTest(branding);
        }

        public async Task<Result<BaseBrandings>> GetTemplateBrandingTest(string app)
        {
            return await _brandingsRepository.GetTemplateBranding(app);
        }

        #endregion Signatures
    }
}