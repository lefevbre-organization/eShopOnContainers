namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.IntegrationEvents.Events
{
    using Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public record ChangueStateUserMailIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public bool State { get; set; }

        public ConfigUserLexon Configuration { get; set; }

        public ChangueStateUserMailIntegrationEvent(
            string user,
            bool state
            )
        {
            User = user;
            State = state;
        }
    }
}