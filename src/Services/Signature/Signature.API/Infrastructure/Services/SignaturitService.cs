using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using MongoDB.Driver;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using Model;
    using Infrastructure.Repositories;
    public class SignaturitService : ISignaturitService
    {

        public readonly IDocumentsRepository _documentsRepository;
        //private readonly IEventBus _eventBus;
        //private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _client;
        //private readonly HttpClient _clientFiles;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;
        private readonly int _timeoutCreate;
        private readonly Guid _guid;

        //public UsersService(
        //        IOptions<SignatureSettings> settings
        //        , IUsersRepository usersRepository
        //        , IEventBus eventBus
        //        , IHttpClientFactory clientFactory
        //        , ILogger<UsersService> logger
        //    ) : base(logger)
        public SignaturitService(
                IOptions<SignatureSettings> settings
            , IConfiguration configuration
            //, IEventBus eventBus
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            //_clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            //_client = _clientFactory.CreateClient();
            //_client.BaseAddress = new Uri(_settings.Value.SignatureMySqlUrl);
            //_client.DefaultRequestHeaders.Add("Accept", "text/plain");
            _configuration = configuration;
            _timeout = 10000;
            _timeoutCreate = 90000;
            _guid = Guid.NewGuid();
        }

        public SignaturitService(
            IOptions<SignatureSettings> settings
            , IConfiguration configuration
            , IDocumentsRepository documentsRepository
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _documentsRepository = documentsRepository ?? throw new ArgumentNullException(nameof(documentsRepository));
            _configuration = configuration;
            _timeout = 10000;
            _timeoutCreate = 90000;
            _guid = Guid.NewGuid();
        }

        #region Signatures

        public async Task<IRestResponse> GetSignatures(string user)
        {
            //var guid = Guid.NewGuid();
            Console.WriteLine($"{_guid} - START GetSignatures");
            Console.WriteLine($"{_guid} - Call to:{_settings.Value.SignaturitApiUrl}/signatures.json?lefebvre_id={user}");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures.json?lefebvre_id={user}");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END GetSignatures: {_guid}");

            return response;
        }

        public async Task<IRestResponse> CancelSignature(string id)
        {
            Console.WriteLine($"{_guid} - START GetSignatures");
            Console.WriteLine($"{_guid} - Call to:{_settings.Value.SignaturitApiUrl}/signatures/{id}/cancel.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{id}/cancel.json");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.PATCH);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END GetSignatures");

            return response;
        }

        public async Task<IRestResponse> CreateSignature(CreateSignaturit signatureInfo)
        {
            Console.WriteLine($"{_guid} - START CreateSignature");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/signatures.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures.json");
            var i = 0;
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"{_guid} - Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            foreach (Recipient recipient in signatureInfo.recipients)
            {
                Console.WriteLine($"{_guid} - Adding recipient_{i}");

                request.AddParameter($"recipients[{i}][name]", recipient.name);
                request.AddParameter($"recipients[{i}][email]", recipient.email);
                request.AddParameter($"recipients[{i}][type]", recipient.role);
                if (recipient.signatureType == "certificate")
                {
                    Console.WriteLine($"{_guid} - Adding recipient_{i} - Certificate");
                    request.AddParameter($"{_guid} - recipients[{i}][sign_with_digital_certificate_file]", 1);
                }
                if (recipient.doubleAuthType == "photo")
                {
                    Console.WriteLine($"{_guid} - Adding recipient_{i} - Photo");
                    request.AddParameter($"recipients[{i}][require_photo]", Convert.ToInt32(recipient.doubleAuthInfo));
                }
                else if (recipient.doubleAuthType == "sms")
                {
                    Console.WriteLine($"{_guid} - Adding recipient_{i} - SMS");
                    request.AddParameter($"recipients[{i}][phone]", recipient.doubleAuthInfo);
                    request.AddParameter($"recipients[{i}][require_sms_validation]", 1);
                }
                i += 1;
            }
            i = 0;
            foreach (Recipient recipient in signatureInfo.cc)
            {
                Console.WriteLine($"{_guid} - Adding cc_{i}");
                request.AddParameter($"cc[{i}][name]", recipient.name);
                request.AddParameter($"cc[{i}][email]", recipient.email);
                i += 1;
            }
            i = 0;
            foreach (UserFile file in signatureInfo.files)
            {
                Console.WriteLine($"{_guid} - Adding file_{i}");
                request.AddFileBytes($"files[{i}]", file.file, file.fileName, file.contentType);
                i += 1;
            }
            i = 0;
            foreach (CustomField field in signatureInfo.customFields)
            {
                Console.WriteLine($"{_guid} - Adding CustomField: {field.name} -  {field.value} ");
                request.AddParameter($"data[{field.name}]", field.value);
            }

            Console.WriteLine($"{_guid} - Adding subject");
            request.AddParameter("subject", signatureInfo.subject);
            Console.WriteLine($"{_guid} - Adding body");
            request.AddParameter("body", signatureInfo.body);
            Console.WriteLine($"{_guid} - Adding branding_id");
            request.AddParameter("branding_id", signatureInfo.brandingId);
            Console.WriteLine($"{_guid} - Adding notification url: {_settings.Value.SignatureNotificationUrl}");
            request.AddParameter("events_url", _settings.Value.SignatureNotificationUrl);

            if (signatureInfo.reminders != null)
            {
                Console.WriteLine($"{_guid} - Adding reminders");
                if (signatureInfo.reminders.Length > 0)
                {
                    Console.WriteLine($"{_guid} - number: {signatureInfo.reminders.Length}");
                    foreach (var reminder in signatureInfo.reminders)
                    {

                        request.AddParameter($"reminders[{i}]", reminder);
                        i += 1;
                    }
                }
            }


            if (signatureInfo.expiration != null)
            {
                Console.WriteLine($"{_guid} - Adding expiration");
                request.AddParameter("expire_time", signatureInfo.expiration);
            }

            Console.WriteLine($"{_guid} - Adding callback_url");
            request.AddParameter("callback_url", _settings.Value.CallBackUrl.ToString());


            Console.WriteLine($"{_guid} - Adding coordinates: {signatureInfo.coordinates.Count()}");
            foreach (Coordinate coordinate in signatureInfo.coordinates)
            {
                request.AddParameter(coordinate.param, coordinate.value);
            }

            if (signatureInfo.coordinates.Count > 0 && signatureInfo.deliveryType != "")
            {
                Console.WriteLine($"{_guid} - Adding delivery_type");
                request.AddParameter("delivery_type", signatureInfo.deliveryType);
            }

            Console.WriteLine($"{_guid} - Parameters: {String.Join(",", request.Parameters.Select(p => p.ToString()).ToArray())}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CreateSignature");

            return response;
        }

        public async Task<IRestResponse> DownloadDocument(string signatureId, string documentId)
        {
            Console.WriteLine($"{_guid} - START DownloadDocument");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/signed");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/signed");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadDocument");

            return response;
        }

        public async Task<IRestResponse> DownloadTrail(string signatureId, string documentId)
        {
            Console.WriteLine($"{_guid} - START DownloadTrail");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/audit_trail");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadTrail");

            return response;
        }

        public async Task<IRestResponse> DownloadAttachments(string signatureId, string documentId)
        {
            Console.WriteLine($"{_guid} - START DownloadAttachments");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/attachments");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/attachments");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadAttachments");

            return response;
        }

        public async Task<IRestResponse> sendReminder(string signatureId)
        {
            Console.WriteLine($"{_guid} - START sendReminder");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/reminder.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/reminder.json");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END sendReminder");

            return response;
        }
        #endregion

        #region Brandings
        public async Task<IRestResponse> CreateBranding(BrandingConfiguration brandingInfo)
        {
            Console.WriteLine($"{_guid} - START CreateBranding");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/brandings.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/brandings.json");
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            request.AddParameter("application_texts[sign_button]", brandingInfo.application_texts.sign_button);
            request.AddParameter("application_texts[send_button]", brandingInfo.application_texts.send_button);
            request.AddParameter("application_texts[open_sign_button]", brandingInfo.application_texts.open_sign_button);
            request.AddParameter("application_texts[open_email_button]", brandingInfo.application_texts.open_email_button);
            request.AddParameter("application_texts[terms_and_conditions]", brandingInfo.application_texts.terms_and_conditions);
            request.AddParameter("layout_color", brandingInfo.layout_color);
            request.AddParameter("logo", brandingInfo.logo);
            request.AddParameter("signature_color", brandingInfo.signature_color);
            request.AddParameter("templates[signatures_request]", brandingInfo.templates.signatures_request);
            request.AddParameter("templates[signatures_receipt]", brandingInfo.templates.signatures_receipt);
            request.AddParameter("templates[pending_sign]", brandingInfo.templates.pending_sign);
            request.AddParameter("templates[document_canceled]", brandingInfo.templates.document_canceled);
            request.AddParameter("templates[request_expired]", brandingInfo.templates.request_expired);
            if (brandingInfo.templates.emails_request != null && brandingInfo.templates.emails_request != "")
            {
                request.AddParameter("templates[emails_request]", brandingInfo.templates.emails_request);
            }
            request.AddParameter("text_color", brandingInfo.text_color);
            request.AddParameter("show_survey_page", brandingInfo.show_survey_page);
            request.AddParameter("show_csv", brandingInfo.show_csv);
            request.AddParameter("show_biometric_hash", brandingInfo.show_biometric_hash);
            request.AddParameter("show_welcome_page", brandingInfo.show_welcome_page);

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CreateBranding");

            return response;
        }
        #endregion

        #region CertifiedEmails
        public async Task<IRestResponse> GetEmails(string user)
        {
            Console.WriteLine($"{_guid} - START GetEmails");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/emails.json?lefebvre_id={user}");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/emails.json?lefebvre_id={user}");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END GetEmails");

            return response;
        }

        public async Task<IRestResponse> CreateEmail(CreateEmail emailInfo)
        {
            Console.WriteLine($"{_guid} - START CreateEmail");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/emails.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/emails.json");
            var i = 0;
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"{_guid} - Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            foreach (Recipient recipient in emailInfo.recipients)
            {
                Console.WriteLine($"{_guid} - Adding recipient_{i}");

                request.AddParameter($"recipients[to][{i}][name]", recipient.name);
                request.AddParameter($"recipients[to][{i}][email]", recipient.email);
                i += 1;
            }
            i = 0;
            foreach (Recipient recipient in emailInfo.cc)
            {
                Console.WriteLine($"{_guid} - Adding cc_{i}");
                request.AddParameter($"recipients[cc][{i}][name]", recipient.name);
                request.AddParameter($"recipients[cc][{i}][email]", recipient.email);
                i += 1;
            }
            i = 0;
            foreach (UserFile file in emailInfo.files)
            {
                Console.WriteLine($"{_guid} - Adding attachment_{i}");
                request.AddFileBytes($"attachments[{i}]", file.file, file.fileName, file.contentType);
                i += 1;
            }
            i = 0;
            foreach (CustomField field in emailInfo.customFields)
            {
                Console.WriteLine($"{_guid} - Adding CustomField: {field.name} -  {field.value} ");
                request.AddParameter($"data[{field.name}]", field.value);
            }

            Console.WriteLine($"{_guid} - Adding type: {emailInfo.certificationType}");
            request.AddParameter($"type", emailInfo.certificationType);

            Console.WriteLine($"{_guid} - Adding subject");
            request.AddParameter("subject", emailInfo.subject);
            Console.WriteLine($"{_guid} - Adding body");
            request.AddParameter("body", emailInfo.body);
            Console.WriteLine($"{_guid} - Adding branding_id");
            request.AddParameter("branding_id", emailInfo.brandingId);
            Console.WriteLine($"{_guid} - Adding notification url: {_settings.Value.CertifiedEmailNotificationUrl}");
            request.AddParameter("events_url", _settings.Value.CertifiedEmailNotificationUrl);

            Console.WriteLine($"{_guid} - Parameters: {String.Join(",", request.Parameters.Select(p => p.ToString()).ToArray())}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CreateEmail");

            return response;
        }

        public async Task<IRestResponse> DownloadCertification(string emailId, string certificationId)
        {
            Console.WriteLine($"{_guid} - START DownloadCertification");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/emails/{emailId}/certificates/{certificationId}/download/audit_trail");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/emails/{emailId}/certificates/{certificationId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadCertification");

            return response;
        }

        public BsonDocument DownloadCertificationFile(string emailId, string certificationId)
        {
            Console.WriteLine($"{_guid} - START DownloadCertificationFile");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/emails/{emailId}/certificates/{certificationId}/download/audit_trail");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/emails/{emailId}/certificates/{certificationId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = client.Execute(request);

            var fileContentDisposition = response.Headers.FirstOrDefault(f => f.Name == "Content-Disposition");
            string fileName = ((String)fileContentDisposition.Value).Split("filename=")[1].Replace("\"", "");

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadCertificationFile");

            return new BsonDocument { { "fileContent", Convert.ToBase64String(response.RawBytes) }, { "contentType", response.ContentType }, { "fileName", fileName } };

        }

        #endregion

        #region CertifiedSms
        public async Task<IRestResponse> GetSms(string user)
        {
            Console.WriteLine($"{_guid} - START GetSms");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/sms.json?lefebvre_id={user}");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/sms.json?lefebvre_id={user}");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END GetSms");

            return response;
        }

        public async Task<IRestResponse> CreateSms(CreateSms sms)
        {
            Console.WriteLine($"{_guid} - START CreateSms");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/sms.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/sms.json");
            var i = 0;
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"{_guid} - Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            foreach (SmsRecipient recipient in sms.recipients)
            {
                Console.WriteLine($"{_guid} - Adding recipient_{i}");

                request.AddParameter($"recipients[{i}][name]", recipient.name);
                request.AddParameter($"recipients[{i}][phone]", recipient.phone);
                i += 1;
            }
            i = 0;
            foreach (UserFile file in sms.files)
            {
                Console.WriteLine($"{_guid} - Adding attachment_{i}");
                request.AddFileBytes($"attachments[{i}]", file.file, file.fileName, file.contentType);
                i += 1;
            }
            i = 0;
            foreach (CustomField field in sms.customFields)
            {
                Console.WriteLine($"{_guid} - Adding CustomField: {field.name} -  {field.value} ");
                request.AddParameter($"data[{field.name}]", field.value);
            }

            Console.WriteLine($"{_guid} - Adding type: {sms.certificationType}");
            request.AddParameter($"type", sms.certificationType);

            Console.WriteLine($"{_guid} - Adding body");
            request.AddParameter("body", sms.body);
            Console.WriteLine($"{_guid} - Adding notification url: {_settings.Value.CertifiedSmsNotificationUrl}");
            request.AddParameter("events_url", _settings.Value.CertifiedSmsNotificationUrl);

            Console.WriteLine($"{_guid} - Parameters: {String.Join(",", request.Parameters.Select(p => p.ToString()).ToArray())}");

            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CreateSms");

            return response;
        }

        public async Task<IRestResponse> DownloadSmsCertification(string smsId, string certificationId)
        {
            Console.WriteLine($"{_guid} - START DownloadSmsCertification");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/sms/{smsId}/certificates/{certificationId}/download/audit_trail");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/sms/{smsId}/certificates/{certificationId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadSmsCertification");

            return response;
        }

        public BsonDocument DownloadSmsCertificationFile(string smsId, string certificationId)
        {
            Console.WriteLine($"{_guid} - START DownloadSmsCertificationFile");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/sms/{smsId}/certificates/{certificationId}/download/audit_trail");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/sms/{smsId}/certificates/{certificationId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = client.Execute(request);

            var fileContentDisposition = response.Headers.FirstOrDefault(f => f.Name == "Content-Disposition");
            string fileName = ((String)fileContentDisposition.Value).Split("filename=")[1].Replace("\"", "");

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadSmsCertificationFile");

            return new BsonDocument { { "fileContent", Convert.ToBase64String(response.RawBytes) }, { "contentType", response.ContentType }, { "fileName", fileName } };

        }

        #endregion

        #region DocumentCertification
        public async Task<IRestResponse> CertifyDocument(CreateDocCertification docInfo, bool storeInDb = false)
        {
            Console.WriteLine($"{_guid} - START CertifyDocument");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/files.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/files.json");
            var i = 0;
            var err = 0;

            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            foreach (UserFile file in docInfo.files)
            {
                Console.WriteLine($"Sending file_{i}");
                request.AddFileBytes($"file", file.file, file.fileName, file.contentType);
                i += 1;
            }
            
            IRestResponse response = await client.ExecuteAsync(request);

            if (storeInDb)
            {
                var jsonContent = JsonConvert.DeserializeObject<CertDocument>(response.Content);
                var resultInsert = await insertInMongo(docInfo, jsonContent);

                if (resultInsert.data != null)
                {
                    Console.WriteLine($"{_guid} - Added to MongoDb OK");
                }
                else
                {
                    Console.WriteLine($"{_guid} - Added to MongoDb ERROR");
                    err = 1;
                }
            }


            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CertifyDocument");

            return (err == 1) ? throw new Exception("Error saving response in database") : response;
        }

        public async Task<IRestResponse> GetCertifiedDocuments(string id)
        {
            Console.WriteLine($"{_guid} - START GetCertifiedDocuments");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/files/{id}.json");
            var url = "";

            if (id.ToUpper() == "ALL")
            {
                url = $"{ _settings.Value.SignaturitApiUrl }/files.json";
            } else
            {
                url = $"{ _settings.Value.SignaturitApiUrl }/files/{id}.json";
            }

            var client = new RestClient(url);
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END GetCertifiedDocuments");

            return response;
        }

        public async Task<IRestResponse> DownloadCertifiedDocumentAudit(string id)
        {
            Console.WriteLine($"{_guid} - START DownloadCertifiedDocumentAudit");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/files/{id}/download/audit_trail");
            
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/files/{id}/download/audit_trail");
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadCertifiedDocumentAudit");

            return response;
        }

        public async Task<IRestResponse> DownloadCertifiedDocument(string id)
        {
            Console.WriteLine($"{_guid} - START DownloadCertifiedDocument");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/files/{id}/download");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/files/{id}/download");
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END DownloadCertifiedDocument");

            return response;
        }

        public async Task<IRestResponse> CertifyDocumentAndAudit(CreateDocCertification docInfo)
        {
            Console.WriteLine($"{_guid} - START CertifyDocumentSync");
            Console.WriteLine($"{_guid} - Call to: {_settings.Value.SignaturitApiUrl}/files.json");

            var err = 0;
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/files.json");
            var i = 0;
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            foreach (UserFile file in docInfo.files)
            {
                Console.WriteLine($"Sending file_{i}");
                request.AddFileBytes($"file", file.file, file.fileName, file.contentType);
                i += 1;
            }

            IRestResponse response = await client.ExecuteAsync(request);

            if (response.IsSuccessful)
            {
                var jsonContent = JsonConvert.DeserializeObject<CertDocument>(response.Content);
                var resultInsert = await insertInMongo(docInfo, jsonContent);
                
                if (resultInsert.data != null)
                {
                    Console.WriteLine($"{_guid} - Added to MongoDb OK");
                    // Descargo el documento de auditoría:
                    response = await DownloadCertifiedDocumentAudit(jsonContent.ExternalId);
                } else
                {
                    Console.WriteLine($"{_guid} - Added to MongoDb ERROR");
                    err = 1;
                }
            }

            //Console.WriteLine($"{_guid} - Response: {response.Content}");
            Console.WriteLine($"{_guid} - Response: {response.StatusCode}");
            Console.WriteLine($"{_guid} - END CertifyDocumentSync");

            return (err == 1) ? throw new Exception("Error saving response in database") : response;
        }
        #endregion

        #region Mongo
        public async Task<Result<UserCertDocuments>> insertInMongo(CreateDocCertification docInfo, CertDocument jsonContent)
        {
            Console.WriteLine($"{_guid} - START insertInMongo");

            jsonContent.App = docInfo.app;
            jsonContent.Guid = docInfo.guid;

            var user = await _documentsRepository.GetUser(docInfo.user);
            object result;

            if (user.data == null)
            {
                // Create new registry
                result = await _documentsRepository.Create(
                    new UserCertDocuments()
                    {
                        User = docInfo.user,
                        Documents = new List<CertDocument>() {
                            new CertDocument() {
                                Guid = docInfo.guid,
                                ExternalId = jsonContent.ExternalId,
                                Crc = jsonContent.Crc,
                                CreatedAt = jsonContent.CreatedAt,
                                Email = jsonContent.Email,
                                Name = jsonContent.Name,
                                Size = jsonContent.Size,
                                App = docInfo.app
                            }
                        }
                    }
               );
            } else
            {
                // Upsert registry
                result = await _documentsRepository.UpSertDocument(docInfo.user, 
                    new CertDocument() {
                        Guid = docInfo.guid,
                        ExternalId = jsonContent.ExternalId,
                        Crc = jsonContent.Crc,
                        CreatedAt = jsonContent.CreatedAt,
                        Email = jsonContent.Email,
                        Name = jsonContent.Name,
                        Size = jsonContent.Size,
                        App = docInfo.app
                    });
            }

            // Ver qué hago aquí con el result

            Console.WriteLine($"{_guid} - END insertInMongo");

            return (Result<UserCertDocuments>)result;
        }
        #endregion
    }
}