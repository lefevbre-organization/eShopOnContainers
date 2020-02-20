namespace Account.API.IntegrationEvents.Events
{
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public class UpsertAccountIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }

        public string Provider { get; set; }

        public string Email { get; set; }

        public bool DefaultAccount { get; set; }

        public ConfigImapAccount Config { get; set; }


        public UpsertAccountIntegrationEvent(
            string user,
            string provider,
            string email,
            bool defaultAccount,
            ConfigImapAccount config)
        {
            User = user;
            Provider = provider;
            Email = email;
            DefaultAccount = defaultAccount;
            Config = config;
        }
    }
}
