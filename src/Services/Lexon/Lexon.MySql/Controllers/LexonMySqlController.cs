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
        public async Task<IActionResult> UserAsync(string idUser = "E1621396")
        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var result = await _lexonService.GetUserAsync(idUser);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , string idUser = "E1621396")

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

        [HttpGet]
        [Route("entities/search")]
        [ProducesResponseType(typeof(Result<JosEntityList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosEntityList>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string search = ""
            , long idFilter = 0)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idType < 1)
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
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) || classification?.listaMails?.Length < 1 || classification?.idType < 1 || classification?.idRelated < 1)
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
            if (string.IsNullOrEmpty(classification?.idUser) || string.IsNullOrEmpty(classification?.bbdd) || string.IsNullOrEmpty(classification?.idMail) || classification?.idType < 1 || classification?.idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to remove an actuation");

            var result = await _lexonService.RemoveRelationMailAsync(classification.idType, classification.bbdd, classification.idUser, classification.idMail, classification.idRelated);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


        [HttpGet]
        [Route("classifications/search")]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosRelationsList>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RelationsAsync(
            [FromQuery]int pageSize = 0
            , [FromQuery]int pageIndex = 1
            , short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string idMail = ""
            )
        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idType < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetRelationsAsync(pageSize, pageIndex, idType, bbdd, idUser, idMail);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}