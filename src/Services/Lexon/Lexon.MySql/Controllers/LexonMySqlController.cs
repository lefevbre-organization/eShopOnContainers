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
        [Route("companies")]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<JosUserCompanies>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(
            [FromQuery]int pageSize = 10
            , [FromQuery]int pageIndex = 0
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
            [FromQuery]int pageSize = 10
            , [FromQuery]int pageIndex = 0
            , short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string search = "")

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idType < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var result = await _lexonService.GetEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<int>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync(
            short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string[] listaMails = null
            , long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || listaMails?.Length < 1 || idType < 1 || idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(idType, bbdd, idUser, listaMails, idRelated);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [Route("classifications/delete")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveRelationMailAsync(
            short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string idMail = null
            , long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || string.IsNullOrEmpty(idMail) || idType < 1 || idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to remove an actuation");

            var result = await _lexonService.RemoveRelationMailAsync(idType, bbdd, idUser, idMail, idRelated);
            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}