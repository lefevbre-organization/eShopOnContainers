using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using RestSharp;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using Model;
    using Repositories;

    public class SmsService : ISmsService
    {
        public readonly ISmsRepository _smsRepository;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;
        private readonly int _timeoutFile;

        public SmsService(
            IOptions<SignatureSettings> settings
            , ISmsRepository smsRepository
            , IConfiguration configuration
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _smsRepository = smsRepository ?? throw new ArgumentNullException(nameof(smsRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _configuration = configuration;
            _timeout = 5000;
            _timeoutFile = 90000;

        }

        public async Task<Result<UserSms>> GetSms(string user)
        {
            return await _smsRepository.GetUser(user);
        }

        public async Task<Result<List<UserSms>>> GetAll()
        {
            return await _smsRepository.GetAll();
        }

        public async Task<Result<UserSms>> CreateSms(UserSms sms)
        {
            return await _smsRepository.Create(sms);
        }

        public async Task<Result<bool>> Remove(string user)
        {
            return await _smsRepository.Remove(user);
        }

        public async Task<Result<bool>> UpSertSms(string user, CertifiedSms smsIn)
        {
            return await _smsRepository.UpSertSms(user, smsIn);
        }

        #region Events
        public async Task<Result<bool>> SaveEvent(SmsEventInfo eventInfo)
        {
            return await _smsRepository.SaveEvent(eventInfo);
        }

        public async Task<Result<bool>> ProcessEvent(string certificateId, string eventType)
        {
            ////var result = new Result<BsonDocument>();
            var response = new Result<bool>();

            var result = await _smsRepository.GetSms(certificateId);

            if (result.data != null && result.data.CertifiedSms.Count > 0)
            {

                var user = result.data.User;
                var smsId = result.data.CertifiedSms[0].ExternalId;
                var guid = result.data.CertifiedSms[0].Guid;
                var app = result.data.CertifiedSms[0].App;


                if (app == "lexon")
                {
                    // Se comenta porque de momento no se tiene integración con lexon
                    // Call lexon api to store document
                    // Downloadfile
                    //var file = GetFile(signatureId, documentId, eventType);
                    //response = await SaveFileLexon(file);

                }
                else if (app == "centinela")
                {
                    var certificate = result.data.CertifiedSms[0].Certificates.Find(e => e.ExternalId == certificateId);
                    var cenDocId = certificate.Document.InternalInfo.DocId;
                    var phone = certificate.Phone;
                    var name = certificate.Name ?? "";

                    switch (eventType)
                    {
                        case "certification_completed":
                            // Downloadfile
                            var file = new SignaturitService(_settings, _configuration).DownloadSmsCertificationFile(smsId, certificateId);
                            response = await SaveFileCentinela(file, guid, cenDocId, phone, name);
                            break;
                        default:
                            break;
                    }
                    // Call centinela api to store document

                }
            }

            return response;
        }

        public async Task<Result<List<SmsEventInfo>>> GetEvents(string certificateId)
        {
            return await _smsRepository.GetEvents(certificateId);
        }
        #endregion


        #region HelperFunctions

        public async Task<Result<bool>> SaveFileCentinela(BsonDocument file, string guid, string cenDocId, string phone, string name)
        {
            Console.WriteLine($"START SaveFileCentinela");

            Result<bool> result;

            var url = $"{_settings.Value.CentinelaApiGwUrl}/signatures/audit/post/certification/sms";

            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            var jsonBody = new { guid, documentId = cenDocId, contentFile = file["fileContent"].AsString, name = file["fileName"].AsString, recipient = new { name, phone } };

            client.Timeout = _timeoutFile;

            var outputJson = JsonConvert.SerializeObject(jsonBody);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");

            request.AddParameter("application/json-patch+json", outputJson, ParameterType.RequestBody);

            Console.WriteLine($"Call to: {url}");

            IRestResponse response = await client.ExecuteAsync(request);

            Console.WriteLine($"Response: {response.Content} - {response.StatusCode}");

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

            //Console.WriteLine(response.Content);
            Console.WriteLine($"END SaveFileCentinela");

            return result;
        }

        public async Task<Result<bool>> CancelFileCentinela(string cenDocId)
        {

            Console.WriteLine($"START CancelFileCentinela");

            Result<bool> result;

            var url = $"{_settings.Value.CentinelaApiGwUrl}/signatures/cancelation/{cenDocId}";
            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);

            client.Timeout = _timeout;

            Console.WriteLine($"Call to {url}");

            IRestResponse response = await client.ExecuteAsync(request);

            Console.WriteLine($"Response: {response.ToString()}");

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

            //Console.WriteLine(response.Content);
            Console.WriteLine($"END CancelFileCentinela");

            return result;
        }
        #endregion
    }
}
