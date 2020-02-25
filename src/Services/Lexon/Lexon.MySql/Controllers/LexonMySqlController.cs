using Lexon.MySql.Infrastructure.Services;
using Lexon.MySql.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using System;
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
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UserAsync(string idNavisionUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetUserAsync(idNavisionUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Permite obtener los token necesarios para operar con los microservicios de envio de correo
        /// </summary>
        /// <param name="addTerminatorToToken">opcional, agrega un slash para ayudar a terminar la uri</param>
        /// <returns></returns>
        [HttpPut("token")]
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            [FromBody] TokenModelView tokenRequest
            , bool addTerminatorToToken = true
            )
        {
            if (string.IsNullOrEmpty(tokenRequest.idClienteNavision))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetUserAsync(
                tokenRequest.idClienteNavision, tokenRequest.bbdd,
                tokenRequest.provider, tokenRequest.mailAccount, tokenRequest.idMail, tokenRequest.folder, 
                tokenRequest.idEntityType, tokenRequest.idEntity,
                tokenRequest.mailContacts, addTerminatorToToken);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("companies")]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("entities/masters")]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(MySqlList<JosEntityTypeList, JosEntityType>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetMasterEntitiesAsync()

        {
            var result = await _lexonService.GetMasterEntitiesAsync();
            return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search entities
        /// </summary>
        [HttpPost("entities/search")]
        [ProducesResponseType(typeof(MySqlList<JosEntityList, JosEntity>), (int)HttpStatusCode.OK)]
        //[ProducesResponseType(typeof(MySqlList<JosEntityList, JosEntity>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync( [FromBody] EntitySearchView entitySearch )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");
           // var resultTest = await _lexonService.GetEntitiesNewAsync(entitySearch);
            var result = await _lexonService.GetEntitiesAsync(entitySearch);
            return Ok(result);

            //return (result.Errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search entities
        /// </summary>
        [HttpPost("entities/search/new")]
        [ProducesResponseType(typeof(MySqlCompany), (int)HttpStatusCode.OK)]
        //[ProducesResponseType(typeof(MySqlList<JosEntityList, JosEntity>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetEntitiesAsync([FromBody] EntitySearchView entitySearch)
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");
  
            var resultTest = await _lexonService.GetEntitiesNewAsync(entitySearch);
            return Ok(resultTest);


        }

        /// <summary>
        /// Search entities
        /// </summary>
        [HttpPost("entities/getbyid")]
        [ProducesResponseType(typeof(Result<JosEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosEntity>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntityByIdAsync( [FromBody] EntitySearchById entitySearch )
        {
            if (string.IsNullOrEmpty(entitySearch.idUser) || string.IsNullOrEmpty(entitySearch.bbdd) || entitySearch.idType == null)
                return BadRequest("values invalid. Must be a valid user, bbdd, idType and idEntity to get de Entity");

            var result = await _lexonService.GetEntityAsync(entitySearch);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("classifications/add")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync([FromBody]ClassificationAddView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                classification?.listaMails?.Length < 1 || classification?.idType == null || classification?.idType < 1 ||
                classification?.idRelated == null|| classification?.idRelated < 1)
                return BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(classification);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
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

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
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

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search classifications of mail
        /// </summary>
        [HttpPost("classifications/search")]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RelationsAsync( [FromBody]ClassificationSearchView classification )
        {
            if (string.IsNullOrEmpty(classification.idUser) || string.IsNullOrEmpty(classification.bbdd) || string.IsNullOrEmpty(classification.idMail))
                return BadRequest("values invalid. Must be a valid user, idMail and bbdd to search the entities");

            var result = await _lexonService.GetRelationsAsync(classification);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}