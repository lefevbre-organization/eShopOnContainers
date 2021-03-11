using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.IntegrationsEvents.Events
{
    public record DatabaseBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public DatabaseBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}