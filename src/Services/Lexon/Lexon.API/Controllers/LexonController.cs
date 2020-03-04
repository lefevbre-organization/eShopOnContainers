using Lexon.API.Model;
using Lexon.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
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
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UsersAsync(string idUserNavision = "E1621396")

        {
            if (string.IsNullOrEmpty(idUserNavision))
                return BadRequest("idUser need a correct value");

            var result = await _usersService.GetUserAsync(idUserNavision);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexCompany>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexCompany>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("idUser need a correct value");

            var result = await _usersService.GetCompaniesFromUserAsync( idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #region Classifications

        [HttpPost]
        [Route("classifications")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexActuation>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexActuation>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetClassificationsAsync(
            [FromBody] ClassificationSearchView classificationSearch
            //, [FromHeader(Name = "x-requestid")] string requestId
            )

        {
            if (string.IsNullOrEmpty(classificationSearch.idUser) || string.IsNullOrEmpty(classificationSearch.idMail) || string.IsNullOrEmpty(classificationSearch.bbdd))
                return BadRequest("values invalid. Must be a valid user, bbdd and email order to search the classifications");

            var result = await _usersService.GetClassificationsFromMailAsync(classificationSearch);


            Result<List<LexActuation>> actuaciones = new Result<List<LexActuation>>
            {
                data = result.DataActuation,
                errors = result.Errors,
                infos = result.Infos
            };

            if (actuaciones.errors.Count() > 0 && result.DataActuation.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, actuaciones);
      
            }else if(actuaciones.errors.Count() == 0 && result.DataActuation.Count == 0)
            {
                return NotFound(actuaciones);
            }

            return Ok(actuaciones);

           // return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromBody]ClassificationAddView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || (classification?.listaMails?.Count() <= 0) ||
                string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated == null || classification?.idRelated <= 0 || classification?.idType <= 0)
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
                string.IsNullOrEmpty(classification?.bbdd) || classification?.idRelated == null || classification?.idRelated <= 0 || classification?.idType <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd, email, related and type for remove the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(classification);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion Classifications

        #region Entities

        [HttpGet("entities/types")]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesTypesAsync()
        {
            var result = await _usersService.GetMasterEntitiesAsync();
            return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("entities/folders/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddEntityFolderAsync(
             [FromBody] FolderToEntity entityFolder
    )
        {
            if (string.IsNullOrEmpty(entityFolder.idUser) || string.IsNullOrEmpty(entityFolder.bbdd) || entityFolder?.idType <= 0 || entityFolder.idEntity <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd type and idEntity for make a folder to the entity");


            var result = await _usersService.AddFolderToEntityAsync(entityFolder);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("entities")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesAsync(
                [FromBody] EntitySearchView entitySearch
                )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType <= 0)
                return BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            var entities = await _usersService.GetEntitiesAsync(entitySearch);

            return ResponseEntities(entities);
        }

        [HttpPost("entities/folders")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesFoldersAsync(
        [FromBody] EntitySearchFoldersView entitySearch
        )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType <= 0
                || (entitySearch.idFolder == null && entitySearch.idParent == null))
                return BadRequest("values invalid. Must be a valid user, idCompany, type and idFolder or idParent to search folders");

            var entities = await _usersService.GetEntitiesFoldersAsync(entitySearch);

            return ResponseEntities(entities);
        }

        [HttpPost("entities/documents")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexEntity>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesDocumentsAsync(
            [FromBody] EntitySearchDocumentsView entitySearch
)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType <= 0
                || entitySearch.idFolder == null)
                return BadRequest("values invalid. Must be a valid user, idCompany, type and idFolder to search documents");

            var entities = await _usersService.GetEntitiesDocumentsAsync(entitySearch);

            return ResponseEntities(entities);
        }

        private IActionResult ResponseEntities(MySqlCompany entities)
        {
            var paginatedEntities = new PaginatedItemsViewModel<LexEntity>(entities.PageIndex, entities.PageSize, entities.Count, entities.Data);
            var result = new Result<PaginatedItemsViewModel<LexEntity>>(paginatedEntities, entities.Errors) { infos = entities.Infos };

            if (result.errors.Count() > 0 && result.data.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);

            }
            else if (result.errors.Count() == 0 && result.data.Count == 0)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        [HttpPost("entities/folders/nested")]
        [ProducesResponseType(typeof(Result<LexNestedEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexNestedEntity>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetNestedFoldersAsync(
             [FromBody] FolderNestedView entityFolder
            )
        {
            if (string.IsNullOrEmpty(entityFolder.idUser) || string.IsNullOrEmpty(entityFolder.bbdd) || entityFolder?.idFolder <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd type and idFolder for get the nested folders");

            Result<LexNestedEntity> result = await _usersService.GetNestedFolderAsync(entityFolder);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpPost]
        [Route("entities/getbyid")]
        [ProducesResponseType(typeof(Result<LexEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexEntity>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntityByIdAsync(
            [FromBody] EntitySearchById entitySearch
            )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null || entitySearch.idEntity <= 0)
                return BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            var result = await _usersService.GetEntityById(entitySearch);
          //  return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
            if (result.errors.Count() > 0 && result.data == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);

            }
            else if (result.errors.Count() == 0 && result.data == null)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        #endregion Entities
    }
}