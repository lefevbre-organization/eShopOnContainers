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
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }

        #region Common

        //// GET api/v1/emailuseraccount
        //[HttpGet]
        //[ProducesResponseType(typeof(IEnumerable<UserMail>), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> Get()
        //{
        //        var result = await _accountsService.Get();

        //    return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        //}

        //[HttpGet("{id}")]
        //[ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.OK)]
        //[ProducesResponseType((int)HttpStatusCode.NotFound)]
        //public async Task<IActionResult> Get(string id)
        //{
        //    if (string.IsNullOrEmpty(id))
        //        return BadRequest("id invalid. Must be a valid id to search in database");

        //    var result = await _accountsService.Get(id);

        //    return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        //}

        // POST api/v1/emailuseraccount
        [HttpPost]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Post([FromBody]UserMail accountIn)
        {
            if (string.IsNullOrEmpty(accountIn.User) || string.IsNullOrEmpty(accountIn.Email) || string.IsNullOrEmpty(accountIn.Provider) || string.IsNullOrEmpty(accountIn.guid))
                return BadRequest("values invalid. Must be a valid user, email, provider and guid to insert the userMail");
            var result = await _accountsService.Create(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // PUT api/v1/emailuseraccount
        //[HttpPut]
        //[ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.OK)]
        //[ProducesResponseType((int)HttpStatusCode.NotFound)]
        //public async Task<IActionResult> Put(string id, [FromBody]UserMail accountIn)
        //{
        //    if (string.IsNullOrEmpty(id) )
        //        return BadRequest("id invalid. Must be a valid id to update the userMail");

        //    var result = await _accountsService.Update(id, accountIn);

        //    return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        //}

        // DELETE api/v1/emailuseraccount
        [HttpDelete]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("id invalid. Must be a valid id to delete the userMail");

            var result = await _accountsService.Remove(id);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion

        // GET api/v1/emailuseraccount/getbyuser/5d678a39c4bf563678267305
        // GET api/v1/emailuseraccount/getbyuser/
        [HttpGet("getbyuser/{user}")]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(IEnumerable<UserMail>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByUser(string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("user invalid. Must be a valid user to search the userMail");

            var result = await _accountsService.GetByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/updatedefaultaccount/12456567/test@gmail.com/GOOGLE
        [HttpGet("updatedefaultaccount/{user}/{email}/{provider}/{guid}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateDefaultAccount(
            [FromRoute]string user
            , [FromRoute]string email
            , [FromRoute]string provider = "GO"
            , [FromRoute]string guid = "no_guid_oh_lala")
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(guid))
                return BadRequest("values invalid. Must be a valid user, email, provider and guid to update the defaultAccount of userMail");

            var result = await _accountsService.UpdateDefaultAccount(user, email, provider, guid);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/deleteaccountbyuserandemail/12456567/jsanchco@gmail.com
        [HttpGet("deleteaccountbyuserandemail/{user}/{email}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteAccountByUserAndEmail(
            [FromRoute]string user
            , [FromRoute]string email)
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(email) )
                return BadRequest("values invalid. Must be a valid user and email to delete the defaultAccount of userMail");

            var result = await _accountsService.DeleteAccountByUserAndEmail(user, email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        // GET api/v1/emailuseraccount/resetdefaultaccountbyuser/12456567
        [HttpGet("resetdefaultaccountbyuser/{user}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(UserMail), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> resetdefaultaccountbyuser(
            [FromRoute] string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to reset the defaultAccount");

            var result = await _accountsService.ResetDefaultAccountByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }
    }
}