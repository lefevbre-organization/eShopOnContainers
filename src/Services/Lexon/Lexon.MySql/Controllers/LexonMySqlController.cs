using Lexon.MySql.Infrastructure.Services;
using Lexon.MySql.Model;
using Microsoft.AspNetCore.Mvc;
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

        public LexonMySqlController(
            ILexonMySqlService lexonService
            )
        {
            _lexonService = lexonService ?? throw new ArgumentNullException(nameof(lexonService));
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(JosUserCompanies), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync([FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0, string idUser = "E1621396")

        {
            //var companies = new List<LexonCompany> {
            //    new LexonCompany { IdCompany = 1, Name = "Abogados de Atocha, S.L." },
            //    new LexonCompany { IdCompany = 2, Name = "Servicios Jurídicos Arganzuela" },
            //    new LexonCompany { IdCompany = 3, Name = "Barconsa Asesores" }
            //};

            //var companiesJson = JsonConvert.SerializeObject(companies);
            //return Ok(companiesJson);

            if (!string.IsNullOrEmpty(idUser))
            {
                var itemsByUser = await _lexonService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
                return itemsByUser == null
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            return BadRequest("Error");
        }

        [HttpGet]
        [Route("entities")]
        [ProducesResponseType(typeof(JosEntitiesList), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync()

        {
            var items = await _lexonService.GetMasterEntitiesAsync();
            return items == null
                ? (IActionResult)BadRequest("it´s impossible return the master´s entities")
                : Ok(items);
        }

        [HttpGet]
        [Route("files")]
        [ProducesResponseType(typeof(JosEntitiesList), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync([FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0, short idType = 1, string bbdd = "lexon_pre_shl_02", string idUser = "520", string search = "")

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || idType < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType and bbdd to search the entities");

            var items = await _lexonService.GetEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search);
            return items == null
                ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                : Ok(items);

        }

        [HttpGet]
        [Route("classification/add")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationMailAsync(short idType = 1, string bbdd = "lexon_pre_shl_02", string idUser = "520", string idMail = "asdasdasdasd", long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(bbdd) || string.IsNullOrEmpty(idMail) || idType < 1 || idRelated < 1)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idType, idmail, idRelated and bbdd to create an actuation with the mail");

            var result = await _lexonService.AddRelationMailAsync(idType, bbdd, idUser, idMail, idRelated);
            return  result < 1
                ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                : Ok(result);

        }
    }
}