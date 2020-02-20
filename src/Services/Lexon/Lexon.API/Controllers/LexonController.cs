﻿using Lexon.API.Model;
using Lexon.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
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
            , IEventBus eventBus)
        {
            _usersService = usersService ?? throw new ArgumentNullException(nameof(usersService));
            _settings = lexonSettings.Value;
            _eventBus = eventBus;
        }

        [HttpGet]
        [Route("user")]
        [ProducesResponseType(typeof(Result<LexonUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexonUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UsersAsync(string idUserNavision = "E1621396")

        {
            if (string.IsNullOrEmpty(idUserNavision))
                return BadRequest("idUser need a correct value");

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

        [HttpGet]
        [Route("companies/select")]
        [ProducesResponseType(typeof(Result<LexonCompany>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexonCompany>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SelectCompanyAsync(
            [FromQuery]string idUser
            , [FromQuery]string bbdd)
        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd))
                return BadRequest("values invalid. Must be a valid user and bbdd to select the company");

            var result = await _usersService.SelectCompanyAsync(idUser, bbdd);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexonActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync(
            [FromBody] ClassificationSearchView classificationSearch
            //, [FromHeader(Name = "x-requestid")] string requestId
            )

        {
            if (string.IsNullOrEmpty(classificationSearch.idUser) || string.IsNullOrEmpty(classificationSearch.idMail) || string.IsNullOrEmpty(classificationSearch.bbdd))
                return BadRequest("values invalid. Must be a valid user, bbdd and email order to search the classifications");

            var result = await _usersService.GetClassificationsFromMailAsync(classificationSearch);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromBody]ClassificationAddView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || (classification?.listaMails?.Count() <= 0) ||
                string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated <= 0 || classification?.idType <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd, email, related and type for create the classification");

            var result = await _usersService.AddClassificationToListAsync(classification);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/contacts/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationContactsMailAsync([FromBody]ClassificationContactsView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                string.IsNullOrEmpty(classification?.mail.Provider) || string.IsNullOrEmpty(classification?.mail.MailAccount) || string.IsNullOrEmpty(classification?.mail.Uid) ||
                classification.ContactList == null || classification.ContactList.GetLength(0) <= 0)
                return BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated, bbdd and some contacts to add in a actuation");

            var result = await _usersService.AddRelationContactsMailAsync(classification);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/remove")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveClassificationAsync([FromBody]ClassificationRemoveView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.idMail) ||
                string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated <= 0 || classification?.idType <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd, email, related and type for remove the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(classification);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("entities/types")]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesTypesAsync()
        {
            var result = await _usersService.GetMasterEntitiesAsync();
            return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("entities")]
        //[ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(MySqlList<JosEntityList, LexonEntityBase>), (int)HttpStatusCode.OK)]
        //[ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexonEntityBase>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(MySqlList<JosEntityList, LexonEntityBase>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync(
            [FromBody] EntitySearchView entitySearch
            )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType <= 0)
                return BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            var entities = await _usersService.GetEntitiesListAsync(entitySearch);

            //if (entitySearch.pageIndex == 0 && entitySearch.pageSize == 0)
            //{
                return (entities.Errors.Count > 0) ? (IActionResult)BadRequest(entities) : Ok(entities);
            //}

            //var totalItems = entities.data.Count;

            //var resultPaginatedFinal =
            //    new Result<PaginatedItemsViewModel<LexonEntityBase>>(
            //        new PaginatedItemsViewModel<LexonEntityBase>(entitySearch.pageIndex, entitySearch.pageSize, totalItems, entities.data), entities.errors);

            //return (resultPaginatedFinal.errors.Count > 0) ? (IActionResult)BadRequest(resultPaginatedFinal) : Ok(resultPaginatedFinal);
        }

        [HttpPost]
        [Route("entities/getbyid")]
        [ProducesResponseType(typeof(Result<LexonEntityBase>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexonEntityBase>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntityByIdAsync(
            [FromBody] EntitySearchById entitySearch
            )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null || entitySearch.idEntity <= 0)
                return BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");


                var result = await _usersService.GetEntityById(entitySearch);
                return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);


        }


    }
}