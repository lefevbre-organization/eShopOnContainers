using Microsoft.AspNetCore.Mvc;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Controllers
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Services;
    using ViewModel;

    [Route("api/v1/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly IContactsService _svc;
        private readonly LexonSettings _settings;
        private readonly IEventBus _eventBus;

        public ContactsController(
            IContactsService svc
            , IOptionsSnapshot<LexonSettings> lexonSettings
            , IEventBus eventBus)
        {
            _svc = svc ?? throw new ArgumentNullException(nameof(svc));
            _settings = lexonSettings.Value;
            _eventBus = eventBus;
        }

        /// <summary>
        /// Permite testar si se llega a la aplicación
        /// </summary>
        /// <returns></returns>
        [HttpGet("test")]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<string>), (int)HttpStatusCode.BadRequest)]
        public IActionResult Test()
        {
            var data = $"Lexon.Api (Contacts) v.{ _settings.Version}";
            return Ok(new Result<string>(data));
        }


        #region Contacts


        [HttpPost]
        [Route("{idUser}/{bbdd}")]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(int), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddRelationContactsMailAsync(
            [FromBody] ContactsView classification,
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA"
            )
        {
            if (string.IsNullOrEmpty(classification?.mail.Provider) || string.IsNullOrEmpty(classification?.mail.MailAccount) || string.IsNullOrEmpty(classification?.mail.Uid) ||
                classification.ContactList == null || classification.ContactList.GetLength(0) <= 0)
                return BadRequest("values invalid. Must be a valid idType, idmail, idRelated and some contacts to add in a actuation");

            var result = await _svc.AddRelationContactsMailAsync(env, idUser, bbdd, classification);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/type/{idType}/{idContact}")]
        [ProducesResponseType(typeof(Result<LexContact>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<LexContact>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ContactByIdAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromRoute] short idType = 1,
            [FromRoute] long idContact = 1,
            [FromQuery] string env = "QA"
            )
        {
            if (idContact <= 0 || idType <= 0)
                return BadRequest("values invalid. Must be a valid idType and idEntity to get de Entity");

            var result = await _svc.GetContactAsync(env, idUser, bbdd, idType, idContact);
            return Ok(result);
        }

        [HttpGet("{idUser}/{bbdd}/all")]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexContact>>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<PaginatedItemsViewModel<LexContact>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GetContactsAsync(
            [FromRoute] string idUser = "449",
            [FromRoute] string bbdd = "lexon_admin_02",
            [FromQuery] string env = "QA",
            [FromQuery] int pageSize = 10,
            [FromQuery] int pageIndex = 1
            )
        {

            var result = await _svc.GetAllContactsAsync(env, idUser, bbdd, null, pageIndex, pageSize);
            return Ok(result);
        }


        #endregion Contacts
    }
}