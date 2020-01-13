﻿using Lefebvre.eLefebvreOnContainers.Models;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Controllers
{
    [Route("api/v1/[controller]")]
    [Authorize]
    [ApiController]
    public class LexonController : ControllerBase
    {
        private readonly IUsersService _usersService;
        private readonly IOptions<LexonSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly IIdentityService _identityService;

        public LexonController(
            IUsersService usersService
            , IIdentityService identityService
            , IOptions<LexonSettings> settings
            , IEventBus eventBus)
        {
            _usersService = usersService ?? throw new ArgumentNullException(nameof(usersService));
            _settings = settings;
            _identityService = identityService;
            _eventBus = eventBus;
        }


        [HttpGet]
        [Route("user")]
        [ProducesResponseType(typeof(Result<LexonUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexonUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UsersAsync(string idUserNavision = "E1621396")

        {
            if (string.IsNullOrEmpty(idUserNavision))
                return (IActionResult)BadRequest("idUser need a correct value");

            var result = await _usersService.GetUserAsync(idUserNavision);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonCompany>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonCompany>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("idUser need a correct value");

            var result = await _usersService.GetCompaniesFromUserAsync(0, 1, idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync(
            [FromBody] ClassificationSearch classificationSearch
            , [FromHeader(Name = "x-requestid")] string requestId
            //, [FromQuery]string idUser = "449"
            //, [FromQuery]long? idType = null
            //, [FromQuery]string bbdd = "lexon_admin_02"
            //, [FromQuery]string idMail = "email_nuevo_1"
            //, [FromQuery]int pageSize = 0
            //, [FromQuery]int pageIndex = 1
            )

        {
            if (string.IsNullOrEmpty(classificationSearch.idUser) || string.IsNullOrEmpty(classificationSearch.idMail) || string.IsNullOrEmpty(classificationSearch.bbdd))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, bbdd and email order to search the classifications");

            var result = await _usersService.GetClassificationsFromMailAsync(classificationSearch.pageSize, classificationSearch.pageIndex, classificationSearch.idUser, classificationSearch.bbdd, classificationSearch.idMail, classificationSearch.idType);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync(
            [FromBody]ClassificationAddView classification
            , [FromHeader(Name = "x-requestid")] string requestId)

        {
            var userId = _identityService.GetUserIdentity();
            var userName = this.HttpContext.User.FindFirst(x => x.Type == ClaimTypes.Name).Value;
            //basketCheckout.RequestId = (Guid.TryParse(requestId, out Guid guid) && guid != Guid.Empty) ?  guid : basketCheckout.RequestId;
            if (string.IsNullOrEmpty(classification?.idUser) || (classification?.listaMails?.Count() <= 0) || string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated <= 0 || classification?.idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, bbdd, email, related and type for create the classification");

            var result = await _usersService.AddClassificationToListAsync(classification.idUser, classification.bbdd, classification.listaMails, classification.idRelated, classification.idType);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/remove")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveClassificationAsync([FromBody]ClassificationRemoveView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.idMail) || string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated <= 0 || classification?.idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, bbdd, email, related and type for remove the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(classification.idUser, classification.bbdd, classification.idMail, classification.idRelated, classification.idType);
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
            , [FromQuery]string bbdd)
        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd))
                return (IActionResult)BadRequest("values invalid. Must be a valid user and bbdd to select the company");

            var result = await _usersService.SelectCompanyAsync(idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search entities of differents types, see ClassificationSearch to get info 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("entities")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityBase>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonEntityBase>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync(
            [FromBody] ClassificationSearch classificationSearch
            //, [FromQuery] string idUser = "449"
            //, [FromQuery] string bbdd = "lexon_admin_02"
            //, [FromQuery] short idType = 1
            //, [FromQuery] string search = null
            //, [FromQuery] int idFilter = 1
            //, [FromQuery] int pageSize = 20
            //, [FromQuery] int pageIndex = 1
            )
        {
            if (string.IsNullOrEmpty(classificationSearch.idUser) || string.IsNullOrEmpty(classificationSearch.bbdd) || classificationSearch.idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            if (classificationSearch.pageIndex == 1 && classificationSearch.pageSize == 0)
            {
                var result = await _usersService.GetEntitiesListAsync(classificationSearch.pageSize, classificationSearch.pageIndex, classificationSearch.idType, classificationSearch.idUser, classificationSearch.bbdd, classificationSearch.search, classificationSearch.idFilter);
                return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
            }

            var resultPaginated = await _usersService.GetEntitiesListAsync(classificationSearch.pageSize, classificationSearch.pageIndex, classificationSearch.idType, classificationSearch.idUser, classificationSearch.bbdd, classificationSearch.search, classificationSearch.idFilter);
            var totalItems = resultPaginated.data.Count;

            var resultPaginatedFinal =
                new Result<PaginatedItemsViewModel<LexonEntityBase>>(new PaginatedItemsViewModel<LexonEntityBase>(classificationSearch.pageIndex, classificationSearch.pageSize, totalItems, resultPaginated.data), resultPaginated.errors);

            return (resultPaginatedFinal.errors.Count > 0) ? (IActionResult)BadRequest(resultPaginatedFinal) : Ok(resultPaginatedFinal);
        }

        [HttpGet]
        [Route("files/add")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddFilesAsync(
            [FromQuery]string idUser
            , [FromQuery]string bbdd
            , [FromQuery]long idFile
            , [FromQuery]string nameFile
            , [FromQuery]string descriptionFile = "")

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(nameFile))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idFile, and name for create the file");

            var result = await _usersService.AddFileToListAsync(idUser, bbdd, idFile, nameFile, descriptionFile);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}