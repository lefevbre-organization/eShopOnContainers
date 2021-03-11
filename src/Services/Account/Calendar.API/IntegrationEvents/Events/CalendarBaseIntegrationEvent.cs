using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.IntegrationsEvents.Events
{
    public record CalendarBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public CalendarBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}