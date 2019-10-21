using Lexon.API.Model;
using Lexon.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
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
            , IEventBus eventBus
            )
        {
            _usersService = usersService ?? throw new ArgumentNullException(nameof(usersService));
            _settings = lexonSettings.Value;
            _eventBus = eventBus;
        }

        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(IEnumerable<LexonCompany>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync(string idUser = "E1621396")

        {
            if (string.IsNullOrEmpty(idUser))
                return (IActionResult)BadRequest("idUser need a correct value");

            var itemsByUser = await _usersService.GetCompaniesFromUserAsync(10, 0, idUser);
            if (!itemsByUser.Any())
                Console.WriteLine("id value invalid. Must be a valid user code in the enviroment");

            return Ok(itemsByUser);
        }

        [HttpGet]
        [Route("classifications")]
        [ProducesResponseType(typeof(IEnumerable<LexonActuation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync([FromQuery]string idUser = "E1621396", [FromQuery]long idCompany = 14, [FromQuery]string idMail = "email_nuevo_1", [FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail) || idCompany <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company and email in 0rder to search the classifications");

            var itemsByUser = await _usersService.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
            if (!itemsByUser.Any())
                Console.WriteLine("The search don´t return any data");

            return Ok(itemsByUser);

        }

        [HttpGet]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromQuery]string idUser = "E1621396", [FromQuery]long idCompany = 14, [FromQuery]string idMail = "email_nuevo_1", [FromQuery]short idType = 1, [FromQuery]long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail) || idCompany <= 0 || idRelated <= 0 || idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company, email, related and type for create the classification");

            var result = await _usersService.AddClassificationToListAsync(idUser, idCompany, idMail, idRelated, idType);

            if (result != 1)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        [HttpGet]
        [Route("classifications/remove")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> RemoveClassificationAsync([FromQuery]string idUser = "E1621396", [FromQuery]long idCompany = 14, [FromQuery]string idMail = "email_nuevo_1", [FromQuery]short idType = 1, [FromQuery]long idRelated = 111)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail) || idCompany <= 0 || idRelated <= 0 || idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company, email, related and type for remove the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idType);

            if (result != 1)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        [HttpGet]
        [Route("entities/types")]
        [ProducesResponseType(typeof(IEnumerable<LexonEntityType>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsTypesAsync()

        {
            var itemsByUser = await _usersService.GetClassificationMasterListAsync();
            if (!itemsByUser.Any())
                Console.WriteLine("error getting types of entities");

            return Ok(itemsByUser);
        }

        [HttpGet]
        [Route("companies/select")]
        [ProducesResponseType(typeof(LexonCompany), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SelectCompanyAsync([FromQuery]string idUser, [FromQuery]long idCompany)

        {
            if (string.IsNullOrEmpty(idUser) || idCompany <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, email, related and type for create the classification");

            var result = await _usersService.SelectCompanyAsync(idUser, idCompany);

            return result ? BadRequest() : (IActionResult)Ok(result);
        }

        [HttpGet]
        [Route("entities")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<LexonEntityBase>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<LexonEntityBase>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EntitiesAsync([FromQuery]string idUser = "E1621396", [FromQuery]long idCompany = 14, [FromQuery] short idType = 1, string search = null, [FromQuery]int pageSize = 0, [FromQuery]int pageIndex = 0)

        {
            if (string.IsNullOrEmpty(idUser) || idCompany <= 0 || idType <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idCompany and type for search de entities");

            if (pageIndex == 0 && pageSize == 0)
            {
                var itemsByUser = await _usersService.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search);
                if (!itemsByUser.Any())
                    Console.WriteLine("error getting entities");

                return Ok(itemsByUser);
            }

            var itemsOnPage = await _usersService.GetEntitiesListAsync(pageSize, pageIndex, idType, idUser, idCompany, search);
            var totalItems = itemsOnPage.Count;

            var model = new PaginatedItemsViewModel<LexonEntityBase>(pageIndex, pageSize, totalItems, itemsOnPage);
            return Ok(model);
        }

        //[HttpGet]
        //[Route("files/add")]
        //[ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        //[ProducesResponseType((int)HttpStatusCode.BadRequest)]
        //public async Task<IActionResult> AddFilesAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]long idFile, [FromQuery]string nameFile, [FromQuery]string descriptionFile = "")

        //{
        //    if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(nameFile))
        //        return (IActionResult)BadRequest("values invalid. Must be a valid user, idFile, and name for create the file");

        //    var result = await _usersService.AddFileToListAsync(idUser, idCompany, idFile, nameFile, descriptionFile);

        //    if (result != 1)
        //    {
        //        return BadRequest();
        //    }

        //    return Ok(result);
        //}

        [HttpGet]
        [Route("items")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<LexonUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<LexonUser>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> UsersAsync([FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0, string idUser = null)

        {
            if (!string.IsNullOrEmpty(idUser))
            {
                var itemsByUser = await _usersService.GetListUsersAsync(pageSize, pageIndex, idUser);
                return !itemsByUser.Any()
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            var itemsOnPage = await _usersService.GetListUsersAsync(pageSize, pageIndex, idUser);
            var totalItems = itemsOnPage.Count;

            var model = new PaginatedItemsViewModel<LexonUser>(pageIndex, pageSize, totalItems, itemsOnPage);
            return Ok(model);
        }
    }
}