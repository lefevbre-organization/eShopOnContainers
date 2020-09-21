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

    public class EmailsService : IEmailsService
    {
        public readonly IEmailsRepository _emailsRepository;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;

        public EmailsService(
            IOptions<SignatureSettings> settings
            ,IEmailsRepository emailsRepository
            , IConfiguration configuration
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _emailsRepository = emailsRepository ?? throw new ArgumentNullException(nameof(emailsRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _configuration = configuration;
            _timeout = 5000;

        }

        public async Task<Result<UserEmails>> GetEmails(string user)
        {
            return await _emailsRepository.GetUser(user);
        }

        public async Task<Result<UserEmails>> CreateEmail(UserEmails email)
        {
            return await _emailsRepository.Create(email);
        }

        public async Task<Result<bool>> Remove(string user)
        {
            return await _emailsRepository.Remove(user);
        }

        public async Task<Result<bool>> UpSertEmail(string user, CertifiedEmail emailIn)
        {
            return await _emailsRepository.UpSertEmail(user, emailIn);
        }

        public async Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn)
        {
            return await _emailsRepository.UpSertBranding(user, brandingIn);
        }

        public async Task<Result<bool>> ResetUserBrandings(string user)
        {
            return await _emailsRepository.ResetUserBrandings(user);
        }

        #region Events
        public async Task<Result<bool>> SaveEvent(SignEventInfo eventInfo)
        {
            //return await _emailsRepository.SaveEvent(eventInfo);
            return null;
        }

        public async Task<Result<bool>> ProcessEvent(string signatureId, string documentId, string eventType)
        {
            //////var result = new Result<BsonDocument>();
            //var response = new Result<bool>();

            //var result = await _signaturesRepository.GetSignature(signatureId);

            //if (result.data != null && result.data.Signatures.Count > 0)
            //{
            //    ////var user = result.data["user"].AsString;
            //    ////var guid = result.data["signatures"][0]["guid"].AsString;
            //    ////var app = result.data["signatures"][0]["app"].AsString;

            //    var user = result.data.User;
            //    var guid = result.data.Signatures[0].Guid;
            //    var app = result.data.Signatures[0].App;


            //    if (app == "lexon")
            //    {
            //        // Se comenta porque de momento no se tiene integración con lexon
            //        // Call lexon api to store document
            //        // Downloadfile
            //        //var file = GetFile(signatureId, documentId, eventType);
            //        //response = await SaveFileLexon(file);

            //    }
            //    else if (app == "centinela")
            //    {
            //        var cenDocId = result.data.Signatures[0].Documents.Find(e => e.ExternalId == documentId).InternalInfo.DocId;

            //        switch (eventType)
            //        {
            //            case "document_canceled":
            //            case "document_expired":
            //            case "document_declined":
            //                response = await CancelFileCentinela(guid);
            //                break;
            //            case "document_completed":
            //            case "audit_trail_completed":
            //                // Downloadfile
            //                var file = GetFile(signatureId, documentId, eventType);
            //                response = await SaveFileCentinela(file, guid, cenDocId, user, eventType);
            //                break;
            //            default:
            //                break;
            //        }
            //        // Call centinela api to store document

            //    }
            //}

            //return response;

            return null;
        }

        public async Task<Result<List<SignEventInfo>>> GetEvents(string signatureId)
        {
            //return await _signaturesRepository.GetEvents(signatureId);
            return null;
        }
        #endregion
    }
}
