using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Minihub.API.IntegrationsEvents.Events
{
    public class MinihubBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public MinihubBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}