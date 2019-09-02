namespace EmailUserAccount.API.Controllers
{
    #region

    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.Extensions.Options;
    using EmailUserAccount.API.ViewModel;
    using Infrastructure.Services;
    using Model;
    using System.Linq;

    #endregion

    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmailUserAccountController : ControllerBase
    {
        private readonly IAccountsService _accountsService;

        private readonly EmailUserAccountSettings _settings;
        private readonly IEventBus _eventBus;

        public EmailUserAccountController(
            IAccountsService accountsService,
            IOptionsSnapshot<EmailUserAccountSettings> emailUserAccountSettings,
            IEventBus eventBus)
        {
            _accountsService = accountsService ?? throw new ArgumentNullException(nameof(accountsService));
            _settings = emailUserAccountSettings.Value;
            _eventBus = eventBus;
        }

        // GET api/v1/[controller]/companies[?pageSize=3&pageIndex=10]
        [HttpGet]
        [Route("accounts")]
        [ProducesResponseType(typeof(PaginatedItemsViewModel<Account>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(IEnumerable<Account>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AccountsAsync([FromQuery]int pageSize = 10, [FromQuery]int pageIndex = 0, string user = null)
        {
            if (!string.IsNullOrEmpty(user))
            {
                var itemsByUser = await _accountsService.GetListAccountsByUserAsync(pageSize, pageIndex, user);
                return !itemsByUser.Any()
                    ? (IActionResult)BadRequest("id value invalid. Must be a valid user code in the enviroment")
                    : Ok(itemsByUser);
            }

            var itemsOnPage = await _accountsService.GetListAccountsByUserAsync(pageSize, pageIndex, user);
            var totalItems = itemsOnPage.Count;

            var model = new PaginatedItemsViewModel<Account>(pageIndex, pageSize, totalItems, itemsOnPage);
            return Ok(model);
        }
    }
}
