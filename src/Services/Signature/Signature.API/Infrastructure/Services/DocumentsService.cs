using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    using MongoDB.Bson;
    using RestSharp;
    using Microsoft.Extensions.Configuration;
    using Microsoft.AspNetCore.Mvc;
    using Newtonsoft.Json.Linq;
    #endregion

    public class DocumentsService : IDocumentsService
    {
        public readonly IDocumentsRepository _documentsRepository;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;
        private readonly int _timeoutFile;

        public DocumentsService(
            IOptions<SignatureSettings> settings
            , IDocumentsRepository documentsRepository
            , IConfiguration configuration
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _documentsRepository = documentsRepository ?? throw new ArgumentNullException(nameof(documentsRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _configuration = configuration;
            _timeout = 5000;
            _timeoutFile = 90000;

        }

        public async Task<Result<UserCertDocuments>> GetDocuments(string user)
        {
            return await _documentsRepository.GetUser(user);
        }

        public async Task<Result<List<UserCertDocuments>>> GetAll()
        {
            return await _documentsRepository.GetAll();
        }

        public async Task<Result<UserCertDocuments>> CreateDocument(UserCertDocuments document)
        {
            return await _documentsRepository.Create(document);
        }

        public async Task<Result<bool>> Remove(string user)
        {
            return await _documentsRepository.Remove(user);
        }

        public async Task<Result<UserCertDocuments>> UpSertDocument(string user, CertDocument certDocumentIn)
        {
            return await _documentsRepository.UpSertDocument(user, certDocumentIn);
        }
    }
}