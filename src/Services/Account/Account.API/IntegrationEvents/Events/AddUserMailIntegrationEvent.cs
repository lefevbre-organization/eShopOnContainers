namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.IntegrationEvents.Events
{
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public record AddUserMailIntegrationEvent : IntegrationEvent
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

    public record AddRawMessageIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }


        public AddRawMessageIntegrationEvent(string user)
        {
            User = user;
        }
    }
}