namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.IntegrationEvents.Events
{
    #region Using

    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    #endregion

    public class AddOperationAccountIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }

        public string Provider { get; set; }

        public string Email { get; set; }

        public bool DefaultAccount { get; set; }

        public EnTypeOperation TypeOperation { get; set; }

        public AddOperationAccountIntegrationEvent(
            string user,
            string provider,
            string email,
            bool defaultAccount,
            EnTypeOperation typeOperation)
        {
            User = user;
            Provider = provider;
            Email = email;
            DefaultAccount = defaultAccount;
            TypeOperation = typeOperation;
        }
    }

    public enum EnTypeOperation { Create = 1, Remove, UpdateDefaultAccount, Get, Update }
}
