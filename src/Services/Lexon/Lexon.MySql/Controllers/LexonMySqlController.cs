using Lexon.MySql.Infrastructure.Services;
using Lexon.MySql.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Lexon.MySql.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LexonMySqlController : ControllerBase
    {
        private ILexonMySqlService _lexonService;
        private readonly IOptions<LexonSettings> _settings;

        public LexonMySqlController(
            ILexonMySqlService lexonService
            , IOptions<LexonSettings> settings
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _lexonService = lexonService ?? throw new ArgumentNullException(nameof(lexonService));
        }

        [HttpGet("user")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetUserAsync(idNavisionUser);
            return Ok(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenModelView tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision) 
                && (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password)))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            var result = await _lexonService.GetUserAsync(
                tokenRequest.idClienteNavision, tokenRequest.bbdd,
                tokenRequest.provider, tokenRequest.mailAccount, tokenRequest.idMail, tokenRequest.folder,
                tokenRequest.idEntityType, tokenRequest.idEntity,
                tokenRequest.mailContacts, tokenRequest.login, tokenRequest.password,
                addTerminatorToToken);
           
            if(result?.data != null)
                result.data.companies = null;
            
            return  Ok(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPost("token"), Consumes("application/json","application/xml","application/x-www-form-urlencoded","multipart/form-data","text/plain; charset=utf-8","text/html")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenPostAsync(
              [FromForm] string login
             ,[FromForm] string password
             ,[FromForm] bool addTerminatorToToken = true
            )
        {
            var tokenRequest = new TokenModelView
            {
                login = login,
                password = password
            };
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision)
                && (string.IsNullOrEmpty(tokenRequest.login) && string.IsNullOrEmpty(tokenRequest.password)))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment or login and password");

            var result = await _lexonService.GetUserAsync(
                tokenRequest.idClienteNavision, tokenRequest.bbdd,
                tokenRequest.provider, tokenRequest.mailAccount, tokenRequest.idMail, tokenRequest.folder,
                tokenRequest.idEntityType, tokenRequest.idEntity,
                tokenRequest.mailContacts, tokenRequest.login, tokenRequest.password,
                true);

            if (result?.data != null)
                result.data.companies = null;

            return Ok(result);
        }

        [HttpGet("companies")]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetCompaniesFromUserAsync(idUser);
            return Ok(result);
        }

        [HttpGet("entities/masters")]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetMasterEntitiesAsync()

        {
            var result = await _lexonService.GetMasterEntitiesAsync();
            return Ok(result);
        }

        [HttpPost("entities/search")]
        [ProducesResponseType(typeof(MySqlCompany), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesAsync([FromBody] EntitySearchView entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetEntitiesAsync(entitySearch);
            return Ok(result);
        }

        [HttpPost("entities/folders/search")]
        [ProducesResponseType(typeof(MySqlCompany), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesFoldersAsync([FromBody] EntitySearchFoldersView entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetEntitiesAsync(entitySearch);
            return Ok(result);
        }

        [HttpPost("entities/documents/search")]
        [ProducesResponseType(typeof(MySqlCompany), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesDocumentsAsync([FromBody] EntitySearchDocumentsView entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetEntitiesAsync(entitySearch);
            return Ok(result);
        }

        [HttpPost("entities/getbyid")]
        [ProducesResponseType(typeof(Result<LexEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexEntity>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntityByIdAsync([FromBody] EntitySearchById entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, bbdd, idType and idEntity to get de Entity");

            var result = await _lexonService.GetEntityAsync(entitySearch);
            return Ok(result);
        }

        [HttpPost("entities/folders/nested")]
        [ProducesResponseType(typeof(Result<LexNestedEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexNestedEntity>), (int)HttpStatusCode.BadRequest)]
        public IActionResult GetNestedFoldersAsync(
                 [FromBody] FolderNestedView entityFolder
            )
        {
            if (string.IsNullOrEmpty(entityFolder.idUser) || string.IsNullOrEmpty(entityFolder.bbdd) || entityFolder?.idFolder <= 0)
                return BadRequest("values invalid. Must be a valid user, bbdd type and idFolder for get the nested folders");

            Result<LexNestedEntity> result = _lexonService.GetNestedFolderAsync(entityFolder);
            return Ok(result);
        }

        [HttpPost("entities/folders/add")]
        [ProducesResponseType(typeof(Result<long>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddEntityFolderAsync(
             [FromBody] FolderToEntity entityFolder
            )
        {
            if (string.IsNullOrEmpty(entityFolder.idUser) || string.IsNullOrEmpty(entityFolder.bbdd)
                   || entityFolder.idEntity == null || entityFolder.idEntity <= 0
                   || entityFolder.idType == null || entityFolder.idType <= 0
                   )
                return BadRequest("values invalid. Must be a valid user, bbdd , idtype and idEnttity for make a folder to the entity");


            var result = await _lexonService.AddFolderToEntityAsync(entityFolder);
            return Ok(result);
        }

        [HttpPost("classifications/add")]
        [ProducesResponseType(typeof(Result<List<int>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync([FromBody]ClassificationAddView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                classification?.listaMails?.Length < 1 || classification?.idType == null || classification?.idType < 1 ||
                classification?.idRelated == null || classification?.idRelated < 1)
                return BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(classification);

            return Ok(result);
        }

        [HttpPost("classifications/contacts/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationContactsMailAsync([FromBody]ClassificationContactsView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                string.IsNullOrEmpty(classification?.mail.Provider) || string.IsNullOrEmpty(classification?.mail.MailAccount) || string.IsNullOrEmpty(classification?.mail.Uid) ||
                classification.ContactList == null || classification.ContactList.GetLength(0) <= 0)
                return BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated, bbdd and some contacts to add in a actuation");

            var result = await _lexonService.AddRelationContactsMailAsync(classification);

            return Ok(result);
        }

        [HttpPost("classifications/delete")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveRelationMailAsync([FromBody]ClassificationRemoveView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                string.IsNullOrEmpty(classification?.Provider) || string.IsNullOrEmpty(classification?.MailAccount) || string.IsNullOrEmpty(classification?.idMail) ||
                classification?.idType == null || classification?.idType < 1 || classification?.idRelated == null || classification?.idRelated < 1)
                return BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to remove an actuation");

            var result = await _lexonService.RemoveRelationMailAsync(classification);
            return Ok(result);
        }

        [HttpPost("classifications/search")]
        [ProducesResponseType(typeof(MySqlCompany), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RelationsAsync([FromBody]ClassificationSearchView classification)
        {
            if (string.IsNullOrEmpty(classification.idUser) || string.IsNullOrEmpty(classification.bbdd) || string.IsNullOrEmpty(classification.idMail))
                return BadRequest("values invalid. Must be a valid user, idMail and bbdd to search the entities");

            var result = await _lexonService.GetRelationsAsync(classification);
            return Ok(result);
        }
    }
}