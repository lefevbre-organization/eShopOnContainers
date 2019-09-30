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

        // GET api/v1/[controller]/companies[?pageSize=3&pageIndex=10]
        [HttpGet]
        [Route("companies")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<LexonCompany>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<LexonCompany>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CompaniesAsync([FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0, string idUser = null)

        {
            if (!string.IsNullOrEmpty(idUser))
            {
                var itemsByUser = await _usersService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
                return !itemsByUser.Any()
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            var itemsOnPage = await _usersService.GetCompaniesFromUserAsync(pageSize, pageIndex, idUser);
            var totalItems = itemsOnPage.Count;

            var model = new PaginatedItemsViewModel<LexonCompany>(pageIndex, pageSize, totalItems, itemsOnPage);
            return Ok(model);
        }

        // GET api/v1/[controller]/classifications[?pageSize=3&pageIndex=10]
        [HttpGet]
        [Route("classifications")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<LexonActuation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<LexonActuation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]string idMail, [FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0)

        {
            if (!string.IsNullOrEmpty(idUser))
            {
                var itemsByUser = await _usersService.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
                return !itemsByUser.Classifications.List.Any()
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            var itemsOnPage = await _usersService.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
            var totalItems = itemsOnPage.Classifications.List.Length;

            var model = new PaginatedItemsViewModel<LexonActuation>(pageIndex, pageSize, totalItems, itemsOnPage.Classifications.List.ToList());
            return Ok(model);
        }

        [HttpGet]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]string idMail, [FromQuery]int idRelated, [FromQuery]short idType = 1)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, email, related and type for create the classification");

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
        public async Task<IActionResult> RemoveClassificationAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]string idMail, [FromQuery]int idRelated, [FromQuery]short idType = 1)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, email, related and type for create the classification");

            var result = await _usersService.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idType);

            if (result != 1)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        // GET api/v1/[controller]/classifications[?pageSize=3&pageIndex=10]
        [HttpGet]
        [Route("classifications/types")]
        [ProducesResponseType(typeof(IEnumerable<LexonEntity>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsTypesAsync()

        {
            var itemsByUser = await _usersService.GetClassificationMasterListAsync();
            return !itemsByUser.Any()
                ? (IActionResult)BadRequest("error getting types of entities")
                : Ok(itemsByUser);
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

            if (result == null)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        [HttpGet]
        [Route("files")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<LexonFile>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<LexonFile>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> FilesAsync([FromQuery]string idUser, [FromQuery]long idCompany, string search = null, [FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0)

        {
            if (!string.IsNullOrEmpty(idUser))
            {
                var itemsByUser = await _usersService.GetFileListAsync(pageSize, pageIndex, idUser, idCompany, search);
                return !itemsByUser.Any()
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            var itemsOnPage = await _usersService.GetFileListAsync(pageSize, pageIndex, idUser, idCompany, search);
            var totalItems = itemsOnPage.Count;

            var model = new PaginatedItemsViewModel<LexonFile>(pageIndex, pageSize, totalItems, itemsOnPage);
            return Ok(model);
        }

        [HttpGet]
        [Route("files/add")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddFilesAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]long idFile, [FromQuery]string nameFile, [FromQuery]string descriptionFile = "")

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(nameFile))
                return (IActionResult)BadRequest("values invalid. Must be a valid user, idFile, and name for create the file");

            var result = await _usersService.AddFileToListAsync(idUser, idCompany, idFile, nameFile, descriptionFile);

            if (result != 1)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        // GET api/v1/[controller]/items[?pageSize=3&pageIndex=10]
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