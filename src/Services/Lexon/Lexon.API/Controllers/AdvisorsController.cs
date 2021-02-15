using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models;
using Lexon.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AdvisorsController : ControllerBase
    {
        private readonly IAdvisorsService _svc;
        private readonly LexonSettings _settings;
        private readonly IEventBus _eventBus;

        public AdvisorsController(
            IAdvisorsService svc
            , IOptionsSnapshot<LexonSettings> lexonSettings
            , IEventBus eventBus)
        {
            _svc = svc ?? throw new ArgumentNullException(nameof(svc));
            _settings = lexonSettings.Value;
            _eventBus = eventBus;
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"Lexon.Api (Advisors) v.{ _settings.Version}";
            return Ok(new Result<string>(data));
        }


        #region Advisors

        [HttpPost("{idUser}/{bbdd}/contacts")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexContact>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexContact>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetActuationTypesAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromBody] string email = "carmen@carmen.com",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string env = "QA"
            )
        {
            var result = await _svc.GetAdvisorsContact(env, idUser, bbdd, email, pageIndex, pageSize);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idUser}/{bbdd}/expedients")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexAdvisorFile>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexAdvisorFile>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetActuationCategoriesAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromBody] string email = "carmen@carmen.com",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string env = "QA"
            )
        {
            var result = await _svc.GetAdvisorsFilesAsync(env, idUser, bbdd, email, pageIndex, pageSize);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

       
  

        #endregion Entities
    }
}