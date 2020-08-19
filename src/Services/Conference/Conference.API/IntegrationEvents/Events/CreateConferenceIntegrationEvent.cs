using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public class CreateConferenceIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string ConferenceId { get; set; }

        public CreateConferenceIntegrationEvent(
            string userId,
            string conferenceId
            )
        {
            UserId = userId;
            ConferenceId = conferenceId;
        }
    }
}