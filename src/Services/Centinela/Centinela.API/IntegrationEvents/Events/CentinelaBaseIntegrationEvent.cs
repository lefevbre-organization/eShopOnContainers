using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.IntegrationsEvents.Events
{
    public record CentinelaBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public CentinelaBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}