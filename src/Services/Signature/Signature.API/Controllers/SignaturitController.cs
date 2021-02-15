namespace Signature.API.Controllers
{
    #region Usings
    using Infrastructure.Services;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    //using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    //using Microsoft.eShopOnContainers.Services.Signature.API.Model;
    using Microsoft.Extensions.Options;
    using System;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Signature.API.Model;
    using RestSharp;
    using Microsoft.Extensions.Configuration;
    using Newtonsoft.Json.Linq;

    #endregion

    [Route("api/v1/Signaturit/")]
    [ApiController]
    public class SignaturitController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ISignaturitService _signaturitService;
        private readonly IOptions<SignatureSettings> _settings;

        public SignaturitController(IConfiguration configuration, ISignaturitService signaturitService, IOptions<SignatureSettings> settings)
        {
            _configuration = configuration;
            _signaturitService = signaturitService ?? throw new ArgumentNullException(nameof(signaturitService));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        #region Signatures


        [HttpGet]
        [Route("signatures/getSignatures/{user}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetSignatures([FromRoute] string user, [FromHeader] string Authorization)
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
                var response = await _signaturitService.GetSignatures(user);

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
        [Route("signatures/cancelSignature/{id}")]
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
                var response = await _signaturitService.CancelSignature(id);

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
        [Route("signatures/newSignature")]
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
                var response = await _signaturitService.CreateSignature(signatureInfo);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return Ok(response.Content);
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    throw new Exception($"{response.ErrorException.Message} - {response.Content} - {response.StatusCode}");
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }

        }

        [HttpGet]
        [Route("signatures/download/{signatureId}/signedDocument/{documentId}/")]
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
                var response = await _signaturitService.DownloadDocument(signatureId, documentId);

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
        [Route("signatures/download/{signatureId}/trailDocument/{documentId}/")]
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
                var response = await _signaturitService.DownloadTrail(signatureId, documentId);

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
        [Route("signatures/download/{signatureId}/attachments/{documentId}/")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadAttachments([FromRoute] string signatureId, [FromRoute] string documentId, [FromHeader] string Authorization)
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
                var response = await _signaturitService.DownloadAttachments(signatureId, documentId);

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
        [Route("signatures/reminder/{signatureId}")]
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
                var response = await _signaturitService.sendReminder(signatureId);

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
        #endregion

        #region Branding
        [HttpPost]
        [Route("signatures/newBranding")]
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
                var response = await _signaturitService.CreateBranding(brandingInfo);

                if (response.IsSuccessful)
                {
                    return Ok(response.Content);
                }
                else
                {
                    if (response.ErrorException != null && response.ErrorException.Message == "The request timed-out")
                    {
                        throw new TimeoutException(response.ErrorException.Message);
                    }
                    else
                    {
                        throw new Exception($"Error: {response.Content}");
                    }
                }
            }
            catch (TimeoutException ex)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout. Signaturit Response:{ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message}");
            }

        }
        #endregion

        #region CertifiedEmail


        [HttpGet]
        [Route("emails/getEmails/{user}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetEmails([FromRoute] string user, [FromHeader] string Authorization)
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
                var response = await _signaturitService.GetEmails(user);

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
        [Route("emails/newEmail")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CreateEmail([FromBody] CreateEmail emailInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(emailInfo, null))
                return BadRequest("Signature information must be provided.");

            try
            {
                var response = await _signaturitService.CreateEmail(emailInfo);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return Ok(response.Content);
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    if (response.ErrorException != null)
                    {
                        throw new Exception($"Internal Exception: {response.ErrorException.Message} - Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                    else
                    {
                        throw new Exception($"Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }

        }


        [HttpGet]
        [Route("emails/download/{emailId}/certificate/{certificateId}/")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadCertification([FromRoute] string emailId, [FromRoute] string certificateId, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(emailId) || string.IsNullOrEmpty(certificateId))
                return BadRequest("A signatureId and documentId must be provided.");

            try
            {

                var response = await _signaturitService.DownloadCertification(emailId, certificateId);

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

        #endregion

        #region CertifiedSms
        [HttpGet]
        [Route("sms/getSms/{user}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetSms([FromRoute] string user, [FromHeader] string Authorization)
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
                var response = await _signaturitService.GetSms(user);

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
        [Route("sms/newSms")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CreateSms([FromBody] CreateSms smsInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(smsInfo, null))
                return BadRequest("Signature information must be provided.");

            try
            {
                var response = await _signaturitService.CreateSms(smsInfo);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return Ok(response.Content);
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    if (response.ErrorException != null)
                    {
                        throw new Exception($"Internal Exception: {response.ErrorException.Message} - Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                    else
                    {
                        throw new Exception($"Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }

        }


        [HttpGet]
        [Route("sms/download/{smsId}/certificate/{certificateId}/")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadSmsCertification([FromRoute] string smsId, [FromRoute] string certificateId, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(smsId) || string.IsNullOrEmpty(certificateId))
                return BadRequest("A signatureId and documentId must be provided.");

            try
            {

                var response = await _signaturitService.DownloadSmsCertification(smsId, certificateId);

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
        #endregion

        #region DocumentCertification
        [HttpPost]
        [Route("documentCertification/newDocument")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CertifyDocument([FromBody] CreateDocCertification docInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(docInfo, null))
                return BadRequest("Document information must be provided.");

            try
            {
                var response = await _signaturitService.CertifyDocument(docInfo, false);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return Ok(response.Content);
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    if (response.ErrorException != null)
                    {
                        throw new Exception($"Internal Exception: {response.ErrorException.Message} - Signaturit Response Content: {response.Content} - Signaturit Response StatusCode: {response.StatusCode}");
                    }
                    else
                    {
                        throw new Exception($"Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }
        }

        [HttpPost]
        [Route("documentCertification/newDocument/download/audit")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CertifyDocumentAndAudit([FromBody] CreateDocCertification docInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(docInfo, null))
                return BadRequest("Document information must be provided.");

            try
            {
                var response = await _signaturitService.CertifyDocumentAndAudit(docInfo);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return File(response.RawBytes, "application/pdf", $"audit-{docInfo.files[0].fileName}.pdf");
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    if (response.ErrorException != null)
                    {
                        throw new Exception($"Internal Exception: {response.ErrorException.Message} - Signaturit Response Content: {response.Content} - Signaturit Response StatusCode: {response.StatusCode}");
                    }
                    else
                    {
                        throw new Exception($"Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }

        }

        [HttpPost]
        [Route("documentCertification/newDocument/storeInDb")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> CertifyDocumentAndStore([FromBody] CreateDocCertification docInfo, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (Object.Equals(docInfo, null))
                return BadRequest("Document information must be provided.");

            try
            {
                var response = await _signaturitService.CertifyDocument(docInfo, true);
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Response IsSuccessful");
                    return Ok(response.Content);
                }
                else
                {
                    Console.WriteLine("Response Error");
                    Console.WriteLine(response.Content.ToString());
                    if (response.ErrorException != null)
                    {
                        throw new Exception($"Internal Exception: {response.ErrorException.Message} - Signaturit Response Content: {response.Content} - Signaturit Response StatusCode: {response.StatusCode}");
                    }
                    else
                    {
                        throw new Exception($"Signaturit Response Content: {response.Content} - Signaturi Response StatusCode: {response.StatusCode}");
                    }
                }
            }
            catch (TimeoutException)
            {
                return StatusCode((int)HttpStatusCode.GatewayTimeout, $"Signature service timeout.");
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error has occurred while executing the request:{ex.Message} - {ex.StackTrace}");
            }
        }

        [HttpGet]
        [Route("documentCertification/get/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> GetCertifiedDocument([FromRoute] string id, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(id))
                return BadRequest("A user must be provided");

            try
            {
                var response = await _signaturitService.GetCertifiedDocuments(id);

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
        [Route("documentCertification/download/audit/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadCertifiedDocumentAudit([FromRoute] string id, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(id) )
                return BadRequest("A documentId must be provided.");

            try
            {

                var response = await _signaturitService.DownloadCertifiedDocumentAudit(id);

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
        [Route("documentCertification/download/{id}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.InternalServerError)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.GatewayTimeout)]
        public async Task<IActionResult> DownloadCertifiedDocumentCopy([FromRoute] string id, [FromHeader] string Authorization)
        {
            HttpRequest httpRequest = HttpContext.Request;

            if (!httpRequest.Headers.ContainsKey("Authorization") || string.IsNullOrEmpty(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token not found");

            if (!checkToken(httpRequest.Headers["Authorization"]))
                return BadRequest("Access token invalid");

            if (string.IsNullOrEmpty(id))
                return BadRequest("A documentId must be provided.");

            try
            {

                var response = await _signaturitService.DownloadCertifiedDocument(id);

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

        #endregion

        #region Token
        private bool checkToken(string authToken)
        {
            bool valid = false;
            var client = new RestClient($"{_settings.Value.LexonApiGwUrl}/utils/Lexon/token/validation?validateCaducity=false");
            client.Timeout = 10000;

            var request = new RestRequest(Method.PUT);
            request.AddHeader("Accept", "text/plain");
            request.AddHeader("Content-Type", "application/json-patch+json");
            request.AddParameter("application/json-patch+json,text/plain", $"\"{authToken}\"", ParameterType.RequestBody);
            
            IRestResponse response = client.Execute(request);

            if (response.IsSuccessful)
            {
                valid = (bool)JObject.Parse(response.Content).SelectToken("$..valid");
            }
            else
            {
                Console.WriteLine("Response is not successfull");
            }
            
            Console.WriteLine($"TokenValid:{valid} - {authToken}");

            //if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Preproduction" ||
            //Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            //{
            //    return true;
            //}

            return valid;
        }
        #endregion
    }
}