namespace Account.API.Controllers
{
    #region

    using Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.Extensions.Options;
    using Model;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;

    #endregion

    [Route("api/v1/usermail")]
    [ApiController]
    public class UserMailController : Controller
    {
        private readonly IAccountsService _accountsService;
        private readonly AccountSettings _settings;
        private readonly IEventBus _eventBus;

        public UserMailController(
            IAccountsService accountsService,
            IOptionsSnapshot<AccountSettings> emailUserAccountSettings,
            IEventBus eventBus)
        {
            _accountsService = accountsService ?? throw new ArgumentNullException(nameof(accountsService));
            _settings = emailUserAccountSettings.Value;
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        // GET api/v1/emailuseraccount/getbyuser/5d678a39c4bf563678267305
        // GET api/v1/emailuseraccount/getbyuser/
        [HttpGet("/{user}")]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(IEnumerable<UserMail>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByUser(
            [FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("user invalid. Must be a valid user to search the userMail");

            var result = await _accountsService.GetByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Post(
            [FromBody]UserMail accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.User) || string.IsNullOrEmpty(accountIn.Email) || string.IsNullOrEmpty(accountIn.Provider) || string.IsNullOrEmpty(accountIn.guid))
                return BadRequest("values invalid. Must be a valid user, email, provider and guid to insert the userMail");

            var result = await _accountsService.Create(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/addorupdate")]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Post(
            [FromRoute]string user
            ,[FromBody]Account accountIn
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(accountIn.email) || string.IsNullOrEmpty(accountIn.provider) || string.IsNullOrEmpty(accountIn.guid))
                return BadRequest("values invalid. Must be a valid user, email, provider and guid to insert the userMail");

            var result = await _accountsService.UpSertAccount(user, accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpDelete("{user}/account/delete/{email}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteAccountByUserAndEmail(
            [FromRoute]string user
            , [FromRoute]string email)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(email))
                return BadRequest("values invalid. Must be a valid user and email to delete the defaultAccount of userMail");

            var result = await _accountsService.DeleteAccountByUserAndEmail(user, email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{user}/account/reset")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> ResetAccounts(
            [FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to reset the defaultAccount");

            var result = await _accountsService.ResetDefaultAccountByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }


    }
}