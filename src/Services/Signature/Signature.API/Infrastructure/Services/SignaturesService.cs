﻿namespace Signature.API.Infrastructure.Services
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
    public class SignaturesService : ISignaturesService
    {
        public readonly ISignaturesRepository _signaturesRepository;
        //private readonly IEventBus _eventBus;
        //private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _client;
        //private readonly HttpClient _clientFiles;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;

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
            , IConfiguration configuration
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
            _configuration = configuration;
            _timeout = 5000;

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

        #region Events
        public async Task<Result<bool>> SaveEvent(EventInfo eventInfo)
        {
            var response = new Result<bool>();
            var result = await _signaturesRepository.SaveEvent(eventInfo);
            return response;
        }

        public async Task<Result<bool>> GetSignature(string signatureId, string documentId)
        {
            //var result = new Result<BsonDocument>();
            var response = new Result<bool>();

            var result = await _signaturesRepository.GetSignature(signatureId);

            if (result.data != null && result.data.Signatures.Count > 0)
            {
                //var user = result.data["user"].AsString;
                //var guid = result.data["signatures"][0]["guid"].AsString;
                //var app = result.data["signatures"][0]["app"].AsString;

                var user = result.data.User;
                var guid = result.data.Signatures[0].Guid;
                var app = result.data.Signatures[0].App;



                // Downloadfile
                var file = GetSignedFile(signatureId, documentId);

                if (app == "lexon")
                {
                    // Call lexon api to store document
                    response = await SaveFileLexon(file);

                }
                else if (app == "centinela")
                {
                    // Call centinela api to store document
                    var cenDocId = result.data.Signatures[0].Documents.Find(e => e.ExternalId == documentId).InternalInfo.DocId;
                    response = await SaveFileCentinela(file, guid, cenDocId);
                    
                }
            }

            return response;
        }
        #endregion

        #region HelperFunctions
        public BsonDocument GetSignedFile(string signatureId, string documentId)
        {

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/signed");
            client.Timeout = 5000;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = client.Execute(request);
            Console.WriteLine(response.Content);

            var fileContentDisposition = response.Headers.FirstOrDefault(f => f.Name == "Content-Disposition");
            string fileName = ((String)fileContentDisposition.Value).Split("filename=")[1].Replace("\"", "");

            return new BsonDocument { { "fileContent", Convert.ToBase64String(response.RawBytes) }, { "contentType", response.ContentType }, { "fileName", fileName } };
        }

        public async Task<Result<bool>> SaveFileLexon(BsonDocument file)
        {
            var result = new Result<bool>();
            var client = new RestClient($"{_settings.Value.LexonApiGwUrl}/lex/Lexon/entities/files/post");
            client.Timeout = -1;
            var request = new RestRequest(Method.POST);
            Dictionary<string, string> values = new Dictionary<string, string>();
            values.Add("idType", "45");
            values.Add("bbdd", "lexon_admin_02");
            values.Add("idUser", "449");
            values.Add("idActuation", "675");
            values.Add("name", file["fileName"].AsString);
            values.Add("contentFile", file["fileContent"].AsString);

            var outputJson = JsonConvert.SerializeObject(values);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");

            request.AddParameter("application/json-patch+json", outputJson, ParameterType.RequestBody);
            IRestResponse response = await client.ExecuteAsync(request);
            
            JObject responseJson = JObject.Parse(response.Content);
            List<Info> infos = (List<Info>)responseJson["infos"].ToObject(typeof(List<Info>));
            List<ErrorInfo> errors = (List<ErrorInfo>)responseJson["errors"].ToObject(typeof(List<ErrorInfo>));

            if (response.Content != null && errors.Count == 0)
            {
                result = new Result<bool>() { errors = new List<ErrorInfo>(), infos = infos, data = true };
            } else
            {
                result = new Result<bool>() { errors = errors, infos = infos, data = false };
            }
            Console.WriteLine(response.Content);

            return result;
        }

        public async Task<Result<bool>> SaveFileCentinela(BsonDocument file, string guid, string cenDocId)
        {
            var result = new Result<bool>();
            var client = new RestClient($"{_settings.Value.CentinelaApiGwUrl}/lex/Lexon/entities/files/post");
            client.Timeout = -1;
            var request = new RestRequest(Method.POST);
            Dictionary<string, string> values = new Dictionary<string, string>();
            values.Add("idNavision", "45");
            values.Add("conceptId", "lexon_admin_02");
            values.Add("name", file["fileName"].AsString);
            values.Add("contentFile", file["fileContent"].AsString);

            var outputJson = JsonConvert.SerializeObject(values);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");

            request.AddParameter("application/json-patch+json", outputJson, ParameterType.RequestBody);
            IRestResponse response = await client.ExecuteAsync(request);

            JObject responseJson = JObject.Parse(response.Content);
            List<Info> infos = (List<Info>)responseJson["infos"].ToObject(typeof(List<Info>));
            List<ErrorInfo> errors = (List<ErrorInfo>)responseJson["errors"].ToObject(typeof(List<ErrorInfo>));

            if (response.Content != null && errors.Count == 0)
            {
                result = new Result<bool>() { errors = new List<ErrorInfo>(), infos = infos, data = true };
            }
            else
            {
                result = new Result<bool>() { errors = errors, infos = infos, data = false };
            }
            Console.WriteLine(response.Content);

            return result;
        }
        #endregion
    }
}