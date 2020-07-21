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

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            return Ok(new Result<bool>(true));
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

            if (result.errors.Count() > 0 && result.data?.idUser == null)
            {
                result.data = null;
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && result.data?.idUser == null)
            {
                return NotFound(result);
            }

            return Ok(result);

        }

        [HttpGet("user/getid")]
        [ProducesResponseType(typeof(Result<LexUserSimple>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUserSimple>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserIdAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            Result<LexUserSimple> resultUser = await _usersService.GetUserIdAsync(idNavisionUser);
            return Ok(resultUser);
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<IEnumerable<LexCompany>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<IEnumerable<LexCompany>>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("idUser need a correct value");

            var result = await _usersService.GetCompaniesFromUserAsync(idUser);

            if (result.errors.Count() > 0 && result.data?.Count() == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && result.data?.Count() == 0)
            {
                return NotFound(result);
            }

            return Ok(result);

           // return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
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

            if (actuaciones.errors.Count() > 0 && result.DataActuation?.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, actuaciones);
            }
            else if (actuaciones.errors.Count() == 0 && (result.DataActuation == null || result.DataActuation?.Count == 0))
            {
                return NotFound(actuaciones);
            }

            return Ok(actuaciones);

            // return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPut]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<List<int>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<int>>), (int)HttpStatusCode.BadRequest)]
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

        [HttpPost("classifications/contact/getbyid")]
        [ProducesResponseType(typeof(Result<LexContact>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexContact>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ContactByIdAsync([FromBody] EntitySearchById entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, bbdd, idType and idEntity to get de Entity");

            Result<LexContact> result = await _usersService.GetContactAsync(entitySearch);
            return Ok(result);
        }

        [HttpPost("classifications/contact/all")]
        [ProducesResponseType(typeof(Result<List<LexContact>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<List<LexContact>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetContactsAsync([FromBody] BaseView search)
        {
            if (string.IsNullOrEmpty(search.idUser) || string.IsNullOrEmpty(search.bbdd))
                return BadRequest("values invalid. Must be a valid user and bbdd");

            Result<List<LexContact>> result = await _usersService.GetAllContactsAsync(search);
            return Ok(result);
        }

        [HttpPost("classifications/{idUser}/check")]
        [ProducesResponseType(typeof(Result<LexUserSimpleCheck>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CheckRelationsMailAsync(
            [FromBody] MailInfo mail,
            [FromRoute] string idUser = "449"
            )
        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(mail.Uid) || string.IsNullOrEmpty(mail.MailAccount))
                return BadRequest("values invalid. Must be a valid idUser, idMail and account to search the relations of mail");

            Result<LexUserSimpleCheck> result = await _usersService.CheckRelationsMailAsync(idUser, mail);
            return Ok(result);
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
            if (string.IsNullOrEmpty(entityFolder.idUser) || string.IsNullOrEmpty(entityFolder.bbdd)
                || entityFolder.idEntity == null || entityFolder.idEntity <= 0
                || entityFolder.idType == null || entityFolder.idType <= 0
                )
                return BadRequest("values invalid. Must be a valid user, bbdd , idtype and idEnttity for make a folder to the entity");

            var result = await _usersService.AddFolderToEntityAsync(entityFolder);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("entities/files/post")]
        [RequestSizeLimit(52000000)]
        //[DisableRequestSizeLimit]
        [ProducesResponseType(typeof(Result<MailFileView>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> FilePost(
            [FromBody] MailFileView fileMail
            )
        {
            Result<MailFileView> resultFile = new Result<MailFileView>(fileMail);
            var result = await _usersService.FilePostAsync(fileMail);
            
            if(result.errors.Count == 0)
            {
                resultFile.errors = result.errors;
                resultFile.infos = result.infos;
                return StatusCode(201, resultFile);

            }

            return BadRequest(result);
        }

        [HttpPost("entities/files/get")]
        [ProducesResponseType(typeof(Result<String>), (int)HttpStatusCode.Created)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> FileGet(
            [FromBody] EntitySearchById fileMail
            )
        {

            var result = await _usersService.FileGetAsync(fileMail);
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

            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd))
                return BadRequest("values invalid. Must be a valid user, bbdd ands idType to serach folders");

            var entities = await _usersService.GetEntitiesFoldersAsync(entitySearch);

            return ResponseEntities(entities);
        }

        private IActionResult ResponseEntities(MySqlCompany entities)
        {
            var paginatedEntities = new PaginatedItemsViewModel<LexEntity>(entities.PageIndex, entities.PageSize, entities.Count, entities.Data);
            var result = new Result<PaginatedItemsViewModel<LexEntity>>(paginatedEntities, entities.Errors) { infos = entities.Infos };

            if (result.errors.Count() > 0 && entities.Data?.Count == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            else if (result.errors.Count() == 0 && (entities.Data == null || entities.Data?.Count == 0 ))
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
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd)
                || entitySearch.idType == null || entitySearch.idEntity == null || entitySearch.idEntity <= 0)
                return BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            var result = await _usersService.GetEntityById(entitySearch);
    
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