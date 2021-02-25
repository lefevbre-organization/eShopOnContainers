namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    #region Using
    using Model;
    using Repositories;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using MongoDB.Bson;
    using RestSharp;
    using Microsoft.Extensions.Configuration;
    using Newtonsoft.Json.Linq;
    #endregion

    public class EmailsService : IEmailsService
    {
        public readonly IEmailsRepository _emailsRepository;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;
        private readonly int _timeoutFile;

        public EmailsService(
            IOptions<SignatureSettings> settings
            , IEmailsRepository emailsRepository
            , IConfiguration configuration
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _emailsRepository = emailsRepository ?? throw new ArgumentNullException(nameof(emailsRepository));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _configuration = configuration;
            _timeout = 5000;
            _timeoutFile = 90000;

        }

        public async Task<Result<UserEmails>> GetEmails(string user)
        {
            return await _emailsRepository.GetUser(user);
        }

        public async Task<Result<List<UserEmails>>> GetAll()
        {
            return await _emailsRepository.GetAll();
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
        public async Task<Result<bool>> SaveEvent(EmailEventInfo eventInfo)
        {
            return await _emailsRepository.SaveEvent(eventInfo);
        }

        public async Task<Result<bool>> ProcessEvent(string certificateId, string eventType)
        {
            ////var result = new Result<BsonDocument>();
            var response = new Result<bool>();

            var result = await _emailsRepository.GetEmail(certificateId);

            if (result.data != null && result.data.CertifiedEmails.Count > 0)
            {

                var user = result.data.User;
                var emailId = result.data.CertifiedEmails[0].ExternalId;
                var guid = result.data.CertifiedEmails[0].Guid;
                var app = result.data.CertifiedEmails[0].App;


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
                    var certificate = result.data.CertifiedEmails[0].Certificates.Find(e => e.ExternalId == certificateId);
                    var cenDocId = certificate.Document.InternalInfo.DocId;
                    var email = certificate.Email;
                    var name = certificate.Name ?? "";

                    switch (eventType)
                    {
                        case "certification_completed":
                            // Downloadfile
                            var file = new SignaturitService(_settings, _configuration).DownloadCertificationFile(emailId, certificateId);
                            response = await SaveFileCentinela(file, guid, cenDocId, email, name);
                            break;
                        default:
                            break;
                    }
                    // Call centinela api to store document

                }
            }

            return response;
        }

        public async Task<Result<List<EmailEventInfo>>> GetEvents(string certificateId)
        {
            return await _emailsRepository.GetEvents(certificateId);
        }
        #endregion


        #region HelperFunctions

        public async Task<Result<bool>> SaveFileCentinela(BsonDocument file, string guid, string cenDocId, string email, string name)
        {
            Console.WriteLine($"START SaveFileCentinela");

            Result<bool> result;

            var url = $"{_settings.Value.CentinelaApiGwUrl}/signatures/audit/post/certification/email";

            var client = new RestClient(url);
            var request = new RestRequest(Method.POST);
            var jsonBody = new { guid, documentId = cenDocId, contentFile = file["fileContent"].AsString, name = file["fileName"].AsString, recipient = new { name, email } };

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