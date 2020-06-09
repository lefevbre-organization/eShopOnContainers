namespace Signature.API.Infrastructure.Services
{
    #region Using
    using Signature.API;
    using Signature.API.Model;
    using Signature.API.Infrastructure.Repositories;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text;
    using System.Threading.Tasks;
    #endregion

    public class BrandingsService : IBrandingsService
    {
        public readonly IBrandingsRepository _brandingsRepository;
        //private readonly IEventBus _eventBus;
        //private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _client;
        //private readonly HttpClient _clientFiles;
        private readonly IOptions<SignatureSettings> _settings;

        //public UsersService(
        //        IOptions<SignatureSettings> settings
        //        , IUsersRepository usersRepository
        //        , IEventBus eventBus
        //        , IHttpClientFactory clientFactory
        //        , ILogger<UsersService> logger
        //    ) : base(logger)
        public BrandingsService(
                IOptions<SignatureSettings> settings
                , IBrandingsRepository brandingsRepository
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _brandingsRepository = brandingsRepository ?? throw new ArgumentNullException(nameof(brandingsRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            //_clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            //_client = _clientFactory.CreateClient();
            //_client.BaseAddress = new Uri(_settings.Value.SignatureMySqlUrl);
            //_client.DefaultRequestHeaders.Add("Accept", "text/plain");
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
            return await _brandingsRepository.GetUserBranding(app,id);
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
