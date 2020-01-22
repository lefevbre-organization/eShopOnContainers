using Lexon.MySql.Infrastructure.Services;
using Lexon.MySql.Model;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet]
        [Route("user")]
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
        /// <param name="idNavisionUser">entrada de usuario, probablemente cambiara directamente al id de lexon</param>
        /// <param name="bbdd">cadena de conexión de la bbdd de la compañia</param>
        /// <param name="provider">opcional, provedor de correo en caso de querer abrir un correo</param>
        /// <param name="emailAccount">opcional, cuenta de correo desde la que se enviará el correo</param>
        /// <param name="uidMail">opcional, uid del correo que se quiere abrir</param>
        /// <param name="idEntityType">opcional, id del tipo d enetidad a relacionar</param>
        /// <param name="idEntity">opcional, id de la entidad a relacionar</param>
        /// <returns></returns>
        [HttpGet]
        [Route("token")]
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUser>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> TokenAsync(
            string idNavisionUser = "E1621396"
            , string bbdd = null // "lexon_admin_02"
            , string provider = null
            , string emailAccount = null
            , string uidMail = null
            , short? idEntityType = null
            , int? idEntity = null)
        {
            if (string.IsNullOrEmpty(idNavisionUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetUserAsync(idNavisionUser, bbdd, provider, emailAccount, uidMail, idEntityType, idEntity);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , string idUser = "449")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("entities/masters")]
        [ProducesResponseType(typeof(Result<JosEntityTypeList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosEntityTypeList>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetMasterEntitiesAsync()

        {
            var result = await _lexonService.GetMasterEntitiesAsync();
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search entities
        /// </summary>
        /// <param name="pageSize">the page size, by default 0 = all</param>
        /// <param name="pageIndex">the page size, by default 1</param>
        /// <param name="idType">the code of type of entitie to search </param>
        /// <param name="bbdd">the string conection of the user</param>
        /// <param name="idUser">the id of the user</param>
        /// <param name="search">thes string value to search</param>
        /// <param name="idFilter">the id to filter (use in documents and folders)</param>
        /// <returns></returns>
        [HttpGet]
        [Route("entities/search")]
        [ProducesResponseType(typeof(Result<JosEntityList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosEntityList>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , short? idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string search = ""
            , long? idFilter = null)
        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idType == null || idType < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search, idFilter);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync([FromBody]ClassificationAddView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                classification?.listaMails?.Length < 1 || classification?.idType == null || classification?.idType < 1 || classification?.idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(classification.idType, classification.bbdd, classification.idUser, classification.listaMails, classification.idRelated);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/delete")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveRelationMailAsync([FromBody]ClassificationRemoveView classification)
        {
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) ||
                string.IsNullOrEmpty(classification?.Provider) || string.IsNullOrEmpty(classification?.MailAccount) || string.IsNullOrEmpty(classification?.idMail) ||
                classification?.idType == null||classification?.idType < 1 || classification?.idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to remove an actuation");

            var result = await _lexonService.RemoveRelationMailAsync(
                classification.idType, classification.bbdd, classification.idUser,
                classification.Provider, classification.MailAccount, classification.idMail, classification.idRelated);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        /// <summary>
        /// Search classifications of mail
        /// </summary>
        /// <param name="pageSize">the page size, by default 0 = all</param>
        /// <param name="pageIndex">the page size, by default 1</param>
        /// <param name="idType">the code of type of entitie to search , if null search all types of sntities</param>
        /// <param name="bbdd">the string conection of the user</param>
        /// <param name="idUser">the id of the user</param>
        /// <param name="idMail">thes string code of the mail</param>
        /// <returns></returns>
        [HttpGet]
        [Route("classifications/search")]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RelationsAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , short? idType = null
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string idMail = "" )
        {
            idType = idType <= 0 ? null : idType; 
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || string.IsNullOrEmpty(idMail))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idMail and bbdd to search the entities");

            var result = await _lexonService.GetRelationsAsync(pageSize, pageIndex, idType, bbdd, idUser, idMail);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}