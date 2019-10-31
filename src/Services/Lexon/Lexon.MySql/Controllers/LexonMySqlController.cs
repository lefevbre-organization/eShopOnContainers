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
        [ProducesResponseType(typeof(JosUserCompanies), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(
            [FromQuery]int pageSize = 10
            , [FromQuery]int pageIndex = 0
            , string idUser = "E1621396")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment");

            var itemsByUser = await _lexonService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
            return itemsByUser == null
                ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                : Ok(itemsByUser);
        }

        [HttpGet]
        [Route("entities/masters")]
        [ProducesResponseType(typeof(JosEntityTypeList), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetMasterEntitiesAsync()

        {
            var items = await _lexonService.GetMasterEntitiesAsync();
            return items == null
                ? (IActionResult)BadRequest("it´s impossible return the master´s entities")
                : Ok(items);
        }

        [HttpGet]
        [Route("entities/search")]
        [ProducesResponseType(typeof(JosEntityList), (int)HttpStatusCode.OK)]
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

            var items = await _lexonService.GetEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search);
            return items == null
                ? (IActionResult)BadRequest("it´s impossible search entities")
                : Ok(items);
        }

        [HttpPost]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync(
            short idType = 1
            , string bbdd = "lexon_admin_02"
            , string idUser = "449"
            , string[] listaMails = null
            , long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || listaMails?.Length <1 || idType < 1 || idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(idType, bbdd, idUser, listaMails, idRelated);
            return result < 0
                ? (IActionResult)BadRequest("it´s impossible add relation")
                : Ok(result);
        }

        [HttpPost]
        [Route("classifications/delete")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
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
            return result < 0
                ? (IActionResult)BadRequest("it´s impossible remove relation")
                : Ok(result);
        }
    }
}