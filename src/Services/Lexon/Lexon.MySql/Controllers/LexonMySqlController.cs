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
            var items = await _lexonService.GetMasterEntities();
            return items == null
                ? (IActionResult)BadRequest("it´s impossible return the master´s entities")
                : Ok(items);
        }
    }
}