using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.API.IntegrationsEvents.Events
{
    public record GoogleAccountBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public GoogleAccountBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}