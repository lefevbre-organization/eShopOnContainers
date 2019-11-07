namespace Account.API.Controllers
{
    #region

    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.Extensions.Options;
    using Account.API.ViewModel;
    using Infrastructure.Services;
    using Model;
    using System.Linq;

    #endregion

    [Route("api/v1/emailuseraccount")]
    [ApiController]
    public class EmailUserAccountController : ControllerBase
    {
        private readonly IAccountsService _accountsService;

        private readonly AccountSettings _settings;
        private readonly IEventBus _eventBus;

        public EmailUserAccountController(
            IAccountsService accountsService,
            IOptionsSnapshot<AccountSettings> emailUserAccountSettings,
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
            var result = await _accountsService.Get();

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/5d678a39c4bf563678267305
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Get(string id)
        {
            var result = await _accountsService.Get(id);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // POST api/v1/emailuseraccount
        [HttpPost]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Post([FromBody]Account accountIn)
        {
            var result = await _accountsService.Create(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // PUT api/v1/emailuseraccount
        [HttpPut]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Put(string id, [FromBody]Account accountIn)
        {
            var result = await _accountsService.Update(id, accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // DELETE api/v1/emailuseraccount
        [HttpDelete]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _accountsService.Remove(id);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion

        // GET api/v1/emailuseraccount/getbyuser/5d678a39c4bf563678267305
        // GET api/v1/emailuseraccount/getbyuser/
        [HttpGet("getbyuser/{user}")]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(IEnumerable<Account>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByUser(string user)
        {
            var result = await _accountsService.GetByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/updatedefaultaccount/12456567/GOOGLE/test@gmail.com
        [HttpGet("updatedefaultaccount/{email}/{user}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateDefaultAccount(string user, string email, string provider = null)
        {
            var result = await _accountsService.UpdateDefaultAccount(user, email, provider);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/deleteaccountbyuserandemail/12456567/jsanchco@gmail.com
        [HttpGet("deleteaccountbyuserandemail/{user}/{email}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteAccountByUserAndEmail(string user, string email)
        {
            var result = await _accountsService.DeleteAccountByUserAndEmail(user, email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/resetdefaultaccountbyuser/12456567
        [HttpGet("resetdefaultaccountbyuser/{user}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Account), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> resetdefaultaccountbyuser(string user)
        {
            var result = await _accountsService.ResetDefaultAccountByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}
