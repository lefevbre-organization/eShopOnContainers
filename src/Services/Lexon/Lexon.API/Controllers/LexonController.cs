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

            //var companies = new List<LexonCompany> {
            //    new LexonCompany { IdCompany = 1, Name = "Abogados de Atocha, S.L." },
            //    new LexonCompany { IdCompany = 2, Name = "Servicios Jurídicos Arganzuela" },
            //    new LexonCompany { IdCompany = 3, Name = "Barconsa Asesores" }
            //};

            //return Ok(companies);

            var itemsByUser = await _usersService.GetCompaniesFromUserAsync(10, 0, idUser);
            if (!itemsByUser.Any())
                Console.WriteLine("id value invalid. Must be a valid user code in the enviroment");

            return Ok(itemsByUser);
        }

        [HttpGet]
        [Route("classifications")]
        [ProducesResponseType(typeof(IEnumerable<LexonActuation>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ClassificationsAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]string idMail, [FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0)

        {
            if (string.IsNullOrEmpty(idUser) || string.IsNullOrEmpty(idMail) || idCompany <= 0)
                return (IActionResult)BadRequest("values invalid. Must be a valid user, company and email in 0rder to search the classifications");

            //var classifications = new LexonActuationMailList
            //{
            //    IdMail = idMail,
            //    Classifications = new LexonActuationList
            //    {
            //        TimeStamp = DateTime.Now.Ticks,
            //        List = new List<LexonActuation>
            //        {
            //            new LexonActuation
            //            {
            //                Name = "Actuación 1",
            //                Description = "2018/000002 - Reclamación a seguros OCASO por accidente múltiple",
            //                IdClassification = 23,
            //                IdType = 1
            //            },
            //            new LexonActuation
            //            {
            //                Name = "Actuación 2",
            //                Description = "2018/000003 - Reclamación a seguros OCASO por accidente múltiple",
            //                IdClassification = 342,
            //                IdType = 2
            //            },
            //            new LexonActuation
            //            {
            //                Name = "Actuación 3",
            //                Description = "2018/000004 - Reclamación a seguros ACCIDENTE por ocaso múltiple",
            //                IdClassification = 231,
            //                IdType = 1
            //            }

            //        }.ToArray()
            //    }
            //};

            //return Ok(classifications);

            var itemsByUser = await _usersService.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
            return itemsByUser != null && itemsByUser.Count > 0
                ? Ok(itemsByUser)
                : (IActionResult)BadRequest("The search don´t return any data");
        }

        [HttpGet]
        [Route("classifications/add")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddClassificationAsync([FromQuery]string idUser, [FromQuery]long idCompany, [FromQuery]string idMail, [FromQuery]long idRelated, [FromQuery]short idType = 1)

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
            //var listLexonClassificationType = new List<LexonEntity>
            //{
            //    new LexonClassificationType {
            //        id = 1, name = "Expedientes"
            //    },
            //    new LexonClassificationType {
            //        id = 2, name = "Clientes"
            //    },
            //    new LexonClassificationType {
            //        id = 3, name = "Contrarios"
            //    },
            //    new LexonClassificationType {
            //        id = 4, name = "Proveedores"
            //    },
            //    new LexonClassificationType {
            //        id = 5, name = "Abogados propios"
            //    },
            //    new LexonClassificationType {
            //        id = 6, name = "Abogados contrarios"
            //    },
            //    new LexonClassificationType {
            //        id = 7, name = "Procuradores propios"
            //    },
            //    new LexonClassificationType {
            //        id = 8, name = "Procuradores contrarios"
            //    },
            //    new LexonClassificationType {
            //        id = 9, name = "Notarios"
            //    },
            //    new LexonClassificationType {
            //        id = 10, name = "Juzgados"
            //    },
            //    new LexonClassificationType {
            //        id = 11, name = "Aseguradoras"
            //    },
            //    new LexonClassificationType {
            //        id = 12, name = "Otros"
            //    },
            //    new LexonClassificationType {
            //        id = 13, name = "Carpetas"
            //    },
            //    new LexonClassificationType {
            //        id = 14, name = "Documentos"
            //    },
            //};

            //return Ok(listLexonClassificationType);


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
            //var listLexonFiles = new List<LexonFile>
            //{
            //    new LexonFile { IdFile = 345556, Name = "EXP-345556", Description = "Expediente 345556" },
            //    new LexonFile { IdFile = 345557, Name = "EXP-345557", Description = "Expediente 345557" },
            //    new LexonFile { IdFile = 345558, Name = "EXP-345558", Description = "Expediente 345558" },
            //    new LexonFile { IdFile = 345559, Name = "EXP-345559", Description = "Expediente 345559" },
            //    new LexonFile { IdFile = 345560, Name = "EXP-345560", Description = "Expediente 345560" }
            //};

            //var listLexonFilesJson = JsonConvert.SerializeObject(listLexonFiles);
            //return Ok(listLexonFilesJson);

            if (!string.IsNullOrEmpty(idUser) || idCompany <= 0)
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