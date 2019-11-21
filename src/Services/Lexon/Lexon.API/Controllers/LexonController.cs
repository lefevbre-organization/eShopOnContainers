using Lexon.API.Model;
using Lexon.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Lexon.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LexonController : ControllerBase
    {
        private readonly IUsersService _usersService;
        private readonly LexonSettings _settings;
        private readonly IEventBus _eventBus;

        public LexonController(
            IUsersService usersService
            , IOptionsSnapshot<LexonSettings> lexonSettings
            , IEventBus eventBus )
        {
            _usersService = usersService ?? throw new ArgumentNullException(nameof(usersService));
            _settings = lexonSettings.Value;
            _eventBus = eventBus;
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonCompany>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonCompany>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "E1621396")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("idUser need a correct value");

            var result = await _usersService.GetCompaniesFromUserAsync(0, 1, idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("classifications")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync(
            [FromQuery]string idUser = "449"
            , [FromQuery]long idCompany = 14
            , [FromQuery]string bbdd = "lexon_admin_02"
            , [FromQuery]string idMail = "email_nuevo_1"
            , [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail) || idCompany <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company and email in 0rder to search the classifications");

            var result = await _usersService.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, bbdd, idMail);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);

        }

        [HttpPut]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromBody]ClassificationAddView classification)  
        {
            if (string.IsNullOrEmpty(classification?.idUser) || (classification?.listaMails?.Count() <= 0) || classification?.idCompany <= 0 || classification?.idRelated <= 0 || classification?.idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company, email, related and type for create the classification");

            var result = await _usersService.AddClassificationToListAsync(classification.idUser, classification.idCompany, classification.listaMails, classification.idRelated, classification.idType);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/remove")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveClassificationAsync([FromBody]ClassificationRemoveView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.idMail) || classification?.idCompany <= 0 || classification?.idRelated <= 0 || classification?.idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company, email, related and type for remove the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(classification.idUser, classification.idCompany, classification.idMail, classification.idRelated, classification.idType);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("entities/types")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityType>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityType>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsTypesAsync()
        {
            var result = await _usersService.GetClassificationMasterListAsync();
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("companies/select")]
        [ProducesResponseType(typeof(Result<LexonCompany>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexonCompany>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SelectCompanyAsync(
            [FromQuery]string idUser
            , [FromQuery]long idCompany)
        {
            if (string.IsNullOrEmpty(idUser) || idCompany <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, email, related and type for create the classification");

            var result = await _usersService.SelectCompanyAsync(idUser, idCompany);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("entities")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityBase>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>),(int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityBase>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync(
            [FromQuery]string idUser = "E1621396"
            , [FromQuery]long idCompany = 14
            , [FromQuery] short idType = 1
            , string search = null
            , [FromQuery] int idFilter = 1
            , [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1)
        {
            if (string.IsNullOrEmpty(idUser) || idCompany <= 0 || idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            if (pageIndex == 0 && pageSize == 0)
            {
                var result = await _usersService.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search, idFilter);
                return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
            }

            var resultPaginated = await _usersService.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search, idFilter);
            var totalItems = resultPaginated.data.Count;

            var resultPaginatedFinal =
                new Result<PaginatedItemsViewModel<LexonEntityBase>>(new PaginatedItemsViewModel<LexonEntityBase>(pageIndex, pageSize, totalItems, resultPaginated.data), resultPaginated.errors);

            return (resultPaginatedFinal.errors.Count > 0) ? (IActionResult)BadRequest(resultPaginatedFinal) : Ok(resultPaginatedFinal);
        }

        [HttpGet]
        [Route("user")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonUser>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonUser>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonUser>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonUser>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UsersAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , string idUser = null)

        {
            if (pageIndex == 0 && pageSize == 0)
            {
                var result = await _usersService.GetListUsersAsync(pageSize, pageIndex, idUser);
                return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
            }

            var resultPaginated = await _usersService.GetListUsersAsync(pageSize, pageIndex, idUser);
            var totalItems = resultPaginated.data.Count;

            var resultPaginatedFinal = 
                new Result<PaginatedItemsViewModel<LexonUser>>(new PaginatedItemsViewModel<LexonUser>(pageIndex, pageSize, totalItems, resultPaginated.data), resultPaginated.errors);

            return (resultPaginatedFinal.errors.Count > 0) ? (IActionResult)BadRequest(resultPaginatedFinal) : Ok(resultPaginatedFinal);
        }
    }
}