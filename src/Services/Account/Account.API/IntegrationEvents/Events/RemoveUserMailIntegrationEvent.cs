namespace Account.API.IntegrationEvents.Events
{
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public class RemoveUserMailIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }

        public ConfigUserLexon Configuration { get; set; }

        public RemoveUserMailIntegrationEvent(
            string user
            )
        {
            User = user;
        }
    }
}