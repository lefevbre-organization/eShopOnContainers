namespace Account.API.IntegrationEvents.Events
{
    using Account.API.Model;

    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public class AddUserMailIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }

        public ConfigUserLexon Configuration { get; set; }

        public AddUserMailIntegrationEvent(
            string user,
            ConfigUserLexon config)
        {
            User = user;
            Configuration = config;
        }
    }
}