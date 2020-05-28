namespace Signature.API.Controllers
{
    #region Usings
    using Infrastructure.Services;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    //using Microsoft.eShopOnContainers.Services.Signature.API.Model;
    using Microsoft.Extensions.Options;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Signature.API.Model;
    using RestSharp;
    using System.Web;
    using Microsoft.Extensions.Configuration;
    using System.Net.Http;
    using System.Net.Http.Headers;
    
    #endregion

    [Route("api/v1/Signaturit")]
    [ApiController]
    public class SignaturitController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly int _timeout;

        public SignaturitController(IConfiguration configuration)
        {
            _configuration = configuration;
            _timeout = 5000;
        }


        [HttpGet]
        [Route("getSignatures/{user}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetSignatures([FromRoute]string user, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(user))
                return BadRequest("A user must be provided");

            try
            {
                var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures.json?lefebvre_id={user}");
                client.Timeout = _timeout;
                var request = new RestRequest(Method.GET);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");

                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                return Ok(response.Content);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }
        }


        [HttpPatch]
        [Route("cancelSignature/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CancelSignature([FromRoute] string id, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(id))
                return BadRequest("A signature id must be provided");

            try
            {
                var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures/{id}/cancel.json");
                client.Timeout = _timeout;
                var request = new RestRequest(Method.PATCH);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
                request.AlwaysMultipartFormData = true;

                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                return Ok(response.Content);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }
        }

        [HttpPost]
        [Route("newSignature")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CreateSignature([FromBody] CreateSignaturit signatureInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(signatureInfo, null))
                return BadRequest("Signature information must be provided.");

            try
            {
                var client = new RestClient("https://api.sandbox.signaturit.com/v3/signatures.json");
                var i = 0;
                client.Timeout = _timeout;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
                foreach (Recipient recipient in signatureInfo.recipients)
                {
                    request.AddParameter($"recipients[{i}][name]", recipient.name);
                    request.AddParameter($"recipients[{i}][email]", recipient.email);
                    i += 1;
                }
                i = 0;
                foreach (UserFile file in signatureInfo.files)
                {
                    request.AddFileBytes($"files[{i}]", file.file, file.fileName);
                }
                foreach (CustomField field in signatureInfo.customFields)
                {
                    request.AddParameter($"data[{field.name}]", field.value);
                }
                request.AddParameter("subject", signatureInfo.subject);
                request.AddParameter("body", signatureInfo.body);
                request.AddParameter("branding_id", signatureInfo.brandingId);
                request.AddParameter("reminders", signatureInfo.reminders);
                request.AddParameter("expire_time", signatureInfo.reminders);

                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                return Ok(response.Content);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }

        }

        [HttpGet]
        [Route("download/{signatureId}/signedDocument/{documentId}/")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadDocument([FromRoute] string signatureId, [FromRoute] string documentId, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(signatureId) || string.IsNullOrEmpty(documentId))
                return BadRequest("A signatureId and documentId must be provided.");

            try
            {
                var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures/{signatureId}/documents/{documentId}/download/signed");
                client.Timeout = _timeout;
                var request = new RestRequest(Method.GET);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
                request.AlwaysMultipartFormData = true;
                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                var fileContentDisposition = response.Headers.FirstOrDefault(f => f.Name == "Content-Disposition");
                string fileName = ((String)fileContentDisposition.Value).Split("filename=")[1].Replace("\"", "");

                return File(response.RawBytes, response.ContentType, fileName); 
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");

            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");

            }
        }

        [HttpGet]
        [Route("download/{signatureId}/trailDocument/{documentId}/")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadTrail([FromRoute] string signatureId, [FromRoute] string documentId, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(signatureId) || string.IsNullOrEmpty(documentId))
                return BadRequest("A signatureId and documentId must be provided.");

            try
            {
                var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures/{signatureId}/documents/{documentId}/download/audit_trail");
                client.Timeout = _timeout;
                var request = new RestRequest(Method.GET);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
                request.AlwaysMultipartFormData = true;
                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                var fileContentDisposition = response.Headers.FirstOrDefault(f => f.Name == "Content-Disposition");
                string fileName = ((String)fileContentDisposition.Value).Split("filename=")[1].Replace("\"", "");

                return File(response.RawBytes, response.ContentType, fileName);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");

            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");

            }
        }

        [HttpPost]
        [Route("reminder/{signatureId}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> sendReminder([FromRoute] string signatureId, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(signatureId))
                return BadRequest("Signature id must be provided.");

            try
            {
                var client = new RestClient($"https://api.sandbox.signaturit.com/v3/signatures/{signatureId}/reminder.json");
                client.Timeout = _timeout;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Authorization", $"Bearer {_configuration.GetValue<string>("Signaturit")}");
                IRestResponse response = await client.ExecuteAsync(request);
                Console.WriteLine(response.Content);

                return Ok(response.Content);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }

        }

        [HttpPost]
        [Route("newBranding")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CreateBranding([FromBody] BrandingConfiguration brandingInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(brandingInfo, null))
                return BadRequest("Branding information must be provided.");

            try
            {
                var client = new RestClient("https://api.sandbox.signaturit.com/v3/brandings.json");
                client.Timeout = _timeout;
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
                Console.WriteLine(response.Content);

                return Ok(response.Content);
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }

        }

        [HttpPost]
        [Route("event/post.json")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> signatureEvent([FromBody] EventInfo eventinfo)
        {
            
        }

        private bool checkToken(string authToken)
        {
            var client = new RestClient("https://lexbox-test-apigwlex.lefebvre.es/api/v1/LexonMySql/token/validation");
            client.Timeout = 10000;
            var request = new RestRequest(Method.PUT);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");
            request.AddHeader("Content-Type", "text/plain");
            request.AddParameter("application/json-patch+json,text/plain", authToken, ParameterType.RequestBody);
            IRestResponse response = client.Execute(request);
            Console.WriteLine(response.Content);

            return true;
        }
    }
}
