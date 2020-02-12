namespace Account.API.Controllers
{
    #region Usings

    using Infrastructure.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Options;
    using Model;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;

    #endregion

    [Route("api/v2/usermail")]
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

        #region User

        [HttpGet("{user}")]
        [ProducesResponseType(typeof(Result<UserMail>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(Result<UserMail>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetByUser(
            [FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("user invalid. Must be a valid user to search the userMail");

            var result = await _accountsService.GetUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<UserMail>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<UserMail>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> PostUser(
            [FromBody] UserMail accountIn
            )
        {
            if (string.IsNullOrEmpty(accountIn.User))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _accountsService.Create(accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/deactivate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Deactivate(
            [FromRoute]string user
            )
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to deactivate");

            var result = await _accountsService.ChangueState(user, false);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/activate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Activate(
            [FromRoute]string user
    )
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to activate");

            var result = await _accountsService.ChangueState(user, true);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeleteUser(
            [FromRoute]string user
            )
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to delete the userMail");

            var result = await _accountsService.Remove(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/config/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> AddUserConfig(
              [FromRoute] string user
            , [FromBody] ConfigUserLexon config
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(config?.defaultAdjunction) || string.IsNullOrEmpty(config?.defaultEntity))
                return BadRequest("values invalid. Must be a valid user and valid data to configuration");

            var result = await _accountsService.UpSertUserConfig(user, config);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion New Region

        #region Accounts


        [HttpPost("{user}/account/{provider}/{mail}/config/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddAccountConfig(
              [FromRoute]string user
            , [FromRoute]string provider
            , [FromRoute]string mail
            , [FromBody] ConfigImapAccount config
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(mail)
                || string.IsNullOrEmpty(config?.imap) || string.IsNullOrEmpty(config?.imapUser) || string.IsNullOrEmpty(config?.imapPass) || config?.imapPort == 0)
                return BadRequest("values invalid. Must be a valid user, email, provider and config account data to insert or update the configuration of imap account");

            var result = await _accountsService.UpSertAccountConfig(user, provider, mail, config);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{user}/account/{provider}/{mail}")]
        [ProducesResponseType(typeof(Result<Account>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<Account>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAccountByMail(
              [FromRoute]string user
            , [FromRoute]string provider
            , [FromRoute]string mail
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(mail))
                return BadRequest("user or mail/provider invalid. Must be a valid user and mail/provider to search the account");

            var result = await _accountsService.GetAccount(user, provider, mail);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpGet("{user}/account/default")]
        [ProducesResponseType(typeof(Result<Account>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<Account>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAccountDefault(
            [FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("user invalid. Must be a valid user to search the default account");

            var result = await _accountsService.GetDefaultAccount(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/delete/{provider}/{email}")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteAccountByUserAndEmail(
              [FromRoute]string user
            , [FromRoute]string provider
            , [FromRoute]string email
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(email))
                return BadRequest("values invalid. Must be a valid user, provider and email to delete the account of userMail");

            var result = await _accountsService.RemoveAccount(user, provider, email);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> PostAccount(
              [FromRoute]string user
            , [FromBody]Account accountIn
            )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(accountIn.email) || string.IsNullOrEmpty(accountIn.provider) || string.IsNullOrEmpty(accountIn.guid))
                return BadRequest("values invalid. Must be a valid user, email, provider and guid to insert the userMail");

            var result = await _accountsService.UpSertAccount(user, accountIn);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/reset")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> ResetAccounts(
            [FromRoute]string user)
        {
            if (string.IsNullOrEmpty(user))
                return BadRequest("values invalid. Must be a valid user to reset the defaultAccount");

            var result = await _accountsService.ResetDefaultAccountByUser(user);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        #endregion New Region

        #region Relations


        [HttpPost("{user}/account/{provider}/{mail}/relation/addorupdate")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddRelationToMail(
              [FromRoute]string user
            , [FromRoute]string provider
            , [FromRoute]string mail
            , [FromBody] MailRelation relation
    )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(mail)
                || string.IsNullOrEmpty(relation?.uid) || string.IsNullOrEmpty(relation?.app) || relation?.idEntity == 0)
                return BadRequest("values invalid. Must be a valid user, email, provider and relations data to insert or update the relation");

            var result = await _accountsService.UpSertRelationMail(user, provider, mail, relation);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/{provider}/{mail}/relation/delete")]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<bool>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RemoveRelationFromMail(
              [FromRoute]string user
            , [FromRoute]string provider
            , [FromRoute]string mail
            , [FromBody] MailRelation relation
        )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(mail)
                || string.IsNullOrEmpty(relation?.uid) || string.IsNullOrEmpty(relation?.app) || relation?.idEntity == 0)
                return BadRequest("values invalid. Must be a valid user, email, provider and relations data to remove the relation");

            var result = await _accountsService.RemoveRelationMail(user, provider, mail, relation);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

        [HttpPost("{user}/account/{provider}/{mail}/{uid}/relations")]
        [ProducesResponseType(typeof(Result<List<MailRelation>>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(Result<List<MailRelation>>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetRelationsFromMail(
              [FromRoute] string user
            , [FromRoute] string provider
            , [FromRoute] string mail
            , [FromRoute] string uid
        )
        {
            if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(provider) || string.IsNullOrEmpty(mail)
                || string.IsNullOrEmpty(uid))
                return BadRequest("values invalid. Must be a valid user, email, provider and uid to get the relations");

            var result = await _accountsService.GetRelationsFromMail(user, provider, mail, uid);

            return (result.errors.Count > 0) ? (IActionResult)BadRequest(result) : Ok(result);
        }

#endregion New Region
    }
}