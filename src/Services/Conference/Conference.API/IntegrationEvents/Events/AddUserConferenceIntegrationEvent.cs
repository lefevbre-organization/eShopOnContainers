using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public record AddUserConferenceIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }

        public AddUserConferenceIntegrationEvent(
            string user,
            short idApp)
        {
            User = user;
            IdApp = idApp;
        }
    }
}