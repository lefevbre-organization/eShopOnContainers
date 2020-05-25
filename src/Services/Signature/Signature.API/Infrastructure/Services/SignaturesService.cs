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
    public class SignaturesService : ISignaturesService
    {
        public readonly ISignaturesRepository _signaturesRepository;
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
        public SignaturesService(
                IOptions<SignatureSettings> settings
                , ISignaturesRepository signaturesRepository
                //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _signaturesRepository = signaturesRepository ?? throw new ArgumentNullException(nameof(signaturesRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            //_clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            //_client = _clientFactory.CreateClient();
            //_client.BaseAddress = new Uri(_settings.Value.SignatureMySqlUrl);
            //_client.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        #region Signatures

        public async Task<Result<UserSignatures>> GetUser(string user)
        {
            return await _signaturesRepository.GetUser(user);
        }

        public async Task<Result<UserSignatures>> Create(UserSignatures signature)
        {
            return await _signaturesRepository.Create(signature);
        }

        public async Task<Result<bool>> Remove(string user)
        {
            return await _signaturesRepository.Remove(user);
        }

        public async Task<Result<bool>> UpSertSignature(string user, Signature signatureIn)
        {
            return await _signaturesRepository.UpSertSignature(user, signatureIn);
        }

        public async Task<Result<bool>> DeleteSignature(string id)
        {
            return await _signaturesRepository.DeleteSignature(id);
        }

        public async Task<Result<int>> AddAvailableSignatures(string user, int num)
        {
            return await _signaturesRepository.AddAvailableSignatures(user, num);
        }

        public async Task<Result<int>> GetAvailableSignatures(string user)
        {
            return await _signaturesRepository.GetAvailableSignatures(user);
        }

        //public async Task<Result<int>> DecAvailableSignatures(string user)
        //{
        //    return await _signaturesRepository.DecAvailableSignatures(user);
        //}

        public async Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn)
        {
            return await _signaturesRepository.UpSertBranding(user, brandingIn);
        }

        #endregion Signatures
    }
}