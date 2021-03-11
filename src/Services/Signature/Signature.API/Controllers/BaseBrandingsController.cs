using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Controllers
{
    #region Usings
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using Model;
    #endregion

    [Route("api/v1/Brandings")]
    [ApiController]
    public class BaseBrandingsController : ControllerBase
    {
        private readonly IBrandingsService _brandingsService;
        private readonly SignatureSettings _settings;
        //private readonly IEventBus _eventBus;

        public BaseBrandingsController(
            IBrandingsService brandingsService
            , IOptionsSnapshot<SignatureSettings> signatureSettings
            )//, IEventBus eventBus)
        {
            _brandingsService = brandingsService ?? throw new ArgumentNullException(nameof(brandingsService));
            _settings = signatureSettings.Value;
            //_eventBus = eventBus;
        }

        //Get default branding by app
        [HttpGet]
        [Route("get/{app}/template")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetTemplateBranding([FromRoute] string app)
        {
            if (string.IsNullOrEmpty(app))
                return BadRequest("invalid user value");

            var result = await _brandingsService.GetTemplateBranding(app);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        //Get default branding by app
        [HttpGet]
        [Route("get/{app}/default")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetDefaultBranding([FromRoute] string app)
        {
            if (string.IsNullOrEmpty(app))
                return BadRequest("invalid user value");

            var result = await _brandingsService.GetDefaultBranding(app);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        //Get default branding by app
        [HttpGet]
        [Route("get/{app}/{id}/user")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetUserBranding([FromRoute] string app, [FromRoute] string id)
        {
            if (string.IsNullOrEmpty(app) || string.IsNullOrEmpty(id))
                return BadRequest("invalid user value");

            var result = await _brandingsService.GetUserBranding(app, id);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("add")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddBranding([FromBody] BaseBrandings brandingIn)
        {
            if (string.IsNullOrEmpty(brandingIn.app) || string.IsNullOrEmpty(brandingIn.type) || string.IsNullOrEmpty(brandingIn.id_signaturit))
                return BadRequest("invalid values");

            var result = await _brandingsService.CreateBranding(brandingIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("addBaseConfigTest")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddBaseConfigurationTest([FromBody] BaseBrandings brandingIn)
        {
            if (string.IsNullOrEmpty(brandingIn.app) || string.IsNullOrEmpty(brandingIn.type) || string.IsNullOrEmpty(brandingIn.id_signaturit))
                return BadRequest("invalid values");

            var result = await _brandingsService.CreateBrandingTest(brandingIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("get/{app}/template/test")]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<BaseBrandings>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetTemplateBrandingTest([FromRoute] string app)
        {
            if (string.IsNullOrEmpty(app))
                return BadRequest("invalid user value");

            var result = await _brandingsService.GetTemplateBrandingTest(app);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
