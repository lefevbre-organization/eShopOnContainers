using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using RestSharp;
using Signature.API.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Infrastructure.Services
{
    public class SignaturitService : ISignaturitService
    {
        
        //private readonly IEventBus _eventBus;
        //private readonly IHttpClientFactory _clientFactory;
        //private readonly HttpClient _client;
        //private readonly HttpClient _clientFiles;
        private readonly IOptions<SignatureSettings> _settings;
        private readonly IConfiguration _configuration;
        private readonly int _timeout;
        private readonly int _timeoutCreate;

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

        }

        #region Signatures

        public async Task<IRestResponse> GetSignatures(string user)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures.json?lefebvre_id={user}");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> CancelSignature(string id)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{id}/cancel.json");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.PATCH);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;

            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> CreateSignature(CreateSignaturit signatureInfo)
        {
            Console.WriteLine("START CreateSignature");
            Console.WriteLine($"Call to: {_settings.Value.SignaturitApiUrl}/signatures.json");

            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures.json");
            var i = 0;
            client.Timeout = _timeoutCreate;
            var request = new RestRequest(Method.POST);

            Console.WriteLine($"Adding parameters");

            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            foreach (Recipient recipient in signatureInfo.recipients)
            {
                Console.WriteLine($"Adding recipient_{i}");

                request.AddParameter($"recipients[{i}][name]", recipient.name);
                request.AddParameter($"recipients[{i}][email]", recipient.email);
                request.AddParameter($"recipients[{i}][type]", recipient.role);
                if (recipient.signatureType == "certificate")
                {
                    Console.WriteLine($"Adding recipient_{i} - Certificate");
                    request.AddParameter($"recipients[{i}][sign_with_digital_certificate_file]", 1);
                }
                if (recipient.doubleAuthType == "photo")
                {
                    Console.WriteLine($"Adding recipient_{i} - Photo");
                    request.AddParameter($"recipients[{i}][require_photo]", Convert.ToInt32(recipient.doubleAuthInfo));
                } else if (recipient.doubleAuthType == "sms") 
                {
                    Console.WriteLine($"Adding recipient_{i} - SMS");
                    request.AddParameter($"recipients[{i}][phone]", recipient.doubleAuthInfo);
                    request.AddParameter($"recipients[{i}][require_sms_validation]", 1);
                }
                i += 1;
            }
            i = 0;
            foreach (Recipient recipient in signatureInfo.cc)
            {
                Console.WriteLine($"Adding cc_{i}");
                request.AddParameter($"cc[{i}][name]", recipient.name);
                request.AddParameter($"cc[{i}][email]", recipient.email);
                i += 1;
            }
            i = 0;
            foreach (UserFile file in signatureInfo.files)
            {
                Console.WriteLine($"Adding file_{i}");
                request.AddFileBytes($"files[{i}]", file.file, file.fileName);
                i += 1;
            }
            i = 0;
            foreach (CustomField field in signatureInfo.customFields)
            {
                Console.WriteLine($"Adding CustomField: {field.name} -  {field.value} ");
                request.AddParameter($"data[{field.name}]", field.value);
            }

            Console.WriteLine($"Adding subject");
            request.AddParameter("subject", signatureInfo.subject);
            Console.WriteLine($"Adding body");
            request.AddParameter("body", signatureInfo.body);
            Console.WriteLine($"Adding branding_id");
            request.AddParameter("branding_id", signatureInfo.brandingId);

            if (signatureInfo.reminders != null)
            {
                Console.WriteLine($"Adding reminders");
                if (signatureInfo.reminders.Length > 0)
                {
                    Console.WriteLine($"number: {signatureInfo.reminders.Length}");
                    foreach (var reminder in signatureInfo.reminders)
                    {
                        
                        request.AddParameter($"reminders[{i}]", reminder);
                        i += 1;
                    }
                }
            }


            if (signatureInfo.expiration != null)
            {
                Console.WriteLine($"Adding expiration");
                request.AddParameter("expire_time", signatureInfo.expiration);
            }

            Console.WriteLine($"Adding callback_url");
            request.AddParameter("callback_url", _settings.Value.CallBackUrl.ToString());


            Console.WriteLine($"Adding coordinates: {signatureInfo.coordinates.Count()}");
            foreach (Coordinate coordinate in signatureInfo.coordinates)
            {
                request.AddParameter(coordinate.param, coordinate.value);
            }

            if (signatureInfo.coordinates.Count > 0 && signatureInfo.deliveryType != "")
            {
                Console.WriteLine($"Adding delivery_type");
                request.AddParameter("delivery_type", signatureInfo.deliveryType);
            }

            Console.WriteLine($"Parameters: {String.Join(",", request.Parameters.Select(p => p.ToString()).ToArray())}");

            IRestResponse response = await client.ExecuteAsync(request);
            
            Console.WriteLine($"Response: {response.Content.ToString()}");

            Console.WriteLine("END CreateSignature");

            return response;
        }

        public async Task<IRestResponse> DownloadDocument(string signatureId, string documentId)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/signed");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> DownloadTrail(string signatureId, string documentId)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/audit_trail");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> DownloadAttachments(string signatureId, string documentId)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/documents/{documentId}/download/attachments");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            request.AlwaysMultipartFormData = true;
            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> sendReminder(string signatureId)
        {
            var client = new RestClient($"{_settings.Value.SignaturitApiUrl}/signatures/{signatureId}/reminder.json");
            client.Timeout = _timeout;
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }

        public async Task<IRestResponse> CreateBranding(BrandingConfiguration brandingInfo)
        {
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
            request.AddParameter("text_color", brandingInfo.text_color);
            request.AddParameter("show_survey_page", brandingInfo.show_survey_page);
            request.AddParameter("show_csv", brandingInfo.show_csv);
            request.AddParameter("show_biometric_hash", brandingInfo.show_biometric_hash);
            request.AddParameter("show_welcome_page", brandingInfo.show_welcome_page);

            IRestResponse response = await client.ExecuteAsync(request);
            //Console.WriteLine(response.Content);

            return response;
        }
        #endregion
    }
}
