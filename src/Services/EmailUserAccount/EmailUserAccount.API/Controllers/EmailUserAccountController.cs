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

    [Route("api/v1/emailuseraccount")]
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

        #region Common

        // GET api/v1/emailuseraccount
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Account>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Get()
        {
            var accounts = await _accountsService.Get();
            return Ok(accounts);
        }

        // GET api/v1/emailuseraccount/5d678a39c4bf563678267305
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Get(string id)
        {
            var account = await _accountsService.Get(id);

            if (account == null)
            {
                return NotFound();
            }

            return Ok(account);
        }

        // POST api/v1/emailuseraccount
        [HttpPost]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Post([FromBody]Account accountIn)
        {
            await _accountsService.Create(accountIn);

            return Ok(accountIn);
        }

        // PUT api/v1/emailuseraccount
        [HttpPut]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Put(string id, [FromBody]Account accountIn)
        {
            var account = await _accountsService.Get(id);

            if (account == null)
            {
                return NotFound();
            }

            await _accountsService.Update(id, account);

            return Ok(accountIn);
        }

        // DELETE api/v1/emailuseraccount
        [HttpDelete]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Delete(string id)
        {
            var account = await _accountsService.Get(id);

            if (account == null)
            {
                return NotFound();
            }

            await _accountsService.Remove(id);

            return Ok(account);
        }

        #endregion

        // GET api/v1/emailuseraccount/getbyuser/5d678a39c4bf563678267305
        // GET api/v1/emailuseraccount/getbyuser/
        [HttpGet("getbyuser/{user}")]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(IEnumerable<Account>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByUser(string user)
        {
            var accounts = await _accountsService.GetByUser(user);

            if (accounts?.Count == 0)
            {
                return NotFound();
            }

            return Ok(accounts);
        }

        // GET api/v1/emailuseraccount/updatedefaultaccount/12456567/GOOGLE/test@gmail.com
        [HttpGet("updatedefaulaccount/{user}/{provider}/{email}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateDefaultAccount(string user, string provider, string email)
        {
            await _accountsService.UpdateDefaultAccount(user, provider, email);

            return Ok();
        }

        // GET api/v1/emailuseraccount/deleteaccountbyuserandprovider/12456567/GOOGLE
        [HttpGet("deleteaccountbyuserandprovider/{user}/{provider}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteAccountByUserAndProvider(string user, string provider)
        {
            var result = await _accountsService.DeleteAccountByUserAndProvider(user, provider);
            if (!result)
            {
                return NotFound();
            }

            return Ok();
        }

        // GET api/v1/emailuseraccount/deleteaccountbyuserandprovider/12456567
        [HttpGet("deleteaccountbyuserandprovider/{user}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> resetdefaultaccountbyuser(string user)
        {
            var result = await _accountsService.ResetDefaultAccountByUser(user);
            if (!result)
            {
                return NotFound();
            }

            return Ok();
        }
    }
}
