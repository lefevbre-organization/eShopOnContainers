using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lexon.API.IntegrationsEvents.Events
{

    public class AssociateMailToClientIntegrationEvent : AssociateMailBaseIntegrationEvent
    {
        public AssociateMailToClientIntegrationEvent(string userId, long clientId, string mailId)
            : base(userId, clientId, mailId)
        {
            AssociateType = "Client";
        }
    }
}