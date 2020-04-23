using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace UserUtils.API.IntegrationsEvents.Events
{
    public class UserUtilsBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public UserUtilsBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}