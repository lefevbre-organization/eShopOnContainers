using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using Model;
    using Repositories;
    using BuidingBlocks.Lefebvre.Models;

    public class DocumentsService : IDocumentsService
    {
        public readonly IDocumentsRepository _documentsRepository;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        //private readonly int _timeout;
        //private readonly int _timeoutFile;

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
            //_timeout = 5000;
            //_timeoutFile = 90000;

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