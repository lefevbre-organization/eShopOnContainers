using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events
{
    public record LexonBaseIntegrationEvent : IntegrationEvent
    {
        public long IdAppNavision { get; set; }
        public string UserId { get; set; }


        public LexonBaseIntegrationEvent(
            long idAppNavision,
            string userId
            )
        {
            IdAppNavision = idAppNavision;
            UserId = userId;
        }

    }

}