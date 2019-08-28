using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lexon.API.IntegrationsEvents.Events
{

    public class AssociateMailToDocumentIntegrationEvent : AssociateMailBaseIntegrationEvent
    {
        public AssociateMailToDocumentIntegrationEvent(string userId, long docId, string mailId)
            : base(userId, docId, mailId)
        {
            AssociateType = "Document";
        }
    }
}