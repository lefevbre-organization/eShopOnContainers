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
    public class ActuationsController : ControllerBase
    {
        private readonly IActuationsService _svc;
        private readonly LexonSettings _settings;
        private readonly IEventBus _eventBus;

        public ActuationsController(
            IActuationsService svc
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
            var data = $"Lexon.Api (Actuations) v.{ _settings.Version}";
            return Ok(new Result<string>(data));
        }

       
        #region Actuations

        [HttpGet("{idUser}/{bbdd}/types")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuationType>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuationType>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetActuationTypesAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
            )
        {
            var result = await _svc.GetActuationTypesAsync(env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/categories")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuationCategory>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuationCategory>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetActuationCategoriesAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
            )
        {
            var result = await _svc.GetActuationCategoriesAsync(env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/{idType}")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetActuationsAsync(
            [FromRoute] string idType = "EMAIL",
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA",
            [FromQuery] string search = null,
            [FromQuery] int? idCategory = null,
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageIndex = 1
        )
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idType))
                return BadRequest("values invalid. Must be a valid idUser and Type ");
            if (pageIndex == 0) pageIndex = 1;
            if (pageSize == 0) pageSize = 10;

            Result<PaginatedItemsViewModel<LexActuation>> result = await _svc.GetActuationsAsync(
                idType: idType,
                idCategory: idCategory,
                idUser: idUser,
                env: env,
                bbdd: bbdd,
                filter: search,
                pageSize,
                pageIndex);
            //return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);

            if (result.errors.Count() > 0 && result.data?.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && (result.data == null || result.data?.Count == 0))
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpPost("{idUser}/{bbdd}/actions")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddActionsAsync(
            [FromBody] LexAction action,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
)
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || string.IsNullOrEmpty(action.IdType) )
                return BadRequest("values invalid. Must be a valid isuser, bbdd, idType to creat and action ");


            var result = await _svc.AddActionAsync(action, env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idUser}/{bbdd}/appointments")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddAppointmentAsync(
            [FromBody] LexAppointment appointment,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
        )
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || string.IsNullOrEmpty(appointment.Subject) || string.IsNullOrEmpty(appointment.StartDate))
                return BadRequest("values invalid. Must be a valid isuser, bbdd, subject and startdate to insert or update ");

 
            var result = await _svc.UpsertAppointmentAsync(appointment, env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/appointments")]
        [ProducesResponseType(typeof(Result<List<LexAppointment>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<LexAppointment>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetAppointmentsAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA",
            [FromQuery] string fromDate = null,
            [FromQuery] string toDate = null,
            [FromQuery] int pageSize = 0,
            [FromQuery] int pageIndex = 0
        )
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd))
                return BadRequest("values invalid. Must be a valid idUser and bbdd ");
            if (pageIndex == 0) pageIndex = 1;
            if (pageSize == 0) pageSize = 10;

            Result<List<LexAppointment>> result = await _svc.GetAppointmentsAsync(
                idUser: idUser,
                bbdd: bbdd,
                env: env,
                fromDate: fromDate,
                toDate: toDate,
                pageSize,
                pageIndex);


            if (result.errors.Count() > 0 && result.data?.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && (result.data == null || result.data?.Count == 0))
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpDelete("{idUser}/{bbdd}/appointments/remove/{idAppointment}")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveAppointmentAsync(
            [FromRoute] int idAppointment = 529,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
        )
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idAppointment <= 0)
                return BadRequest("values invalid. Must be a valid iduser, bbdd and id");


            var result = await _svc.RemoveAppointmentAsync(idAppointment, env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{idUser}/{bbdd}/appointments/{idAppointment}/relation/{idAction}")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddAppointmentActionAsync(
            [FromRoute] int idAppointment = 529,
            [FromRoute] int idAction = 1,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
)
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idAppointment <= 0 || idAction <=0)
                return BadRequest("values invalid. Must be a valid isuser, bbdd, id and idActuation to vinculate action to appointment ");


            Result<int> result = await _svc.AddAppointmentActionAsync(idAppointment, idAction, env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpDelete("{idUser}/{bbdd}/appointments/relation/{idRelation}/remove")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveAppointmentActionAsync(
            [FromRoute] int idRelation = 1,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
        )
        {

            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idRelation <= 0)
                return BadRequest("values invalid. Must be a valid iduser, bbdd and id");


            Result<int> result = await _svc.RemoveAppointmentActionAsync(idRelation, env, idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/appointments/{idEvent}")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetClassificationsAsync(
            [FromRoute] string idEvent = "123456",
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA",
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageIndex = 1
             )

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idEvent))
                return BadRequest("values invalid. Must be a valid idUser and idAppointment ");

            if (pageIndex == 0) pageIndex = 1;
            if (pageSize == 0) pageSize = 10;

            Result<PaginatedItemsViewModel<LexActuation>> result = await _svc.GetRelationsOfAppointmentAsync(idEvent, idUser, env, bbdd, pageSize, pageIndex);

            if (result.errors.Count() > 0 && result.data?.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && (result.data== null || result.data?.Count == 0))
            {
                return NotFound(result);
            }

            return Ok(result);

        }

        #endregion Entities
    }
}