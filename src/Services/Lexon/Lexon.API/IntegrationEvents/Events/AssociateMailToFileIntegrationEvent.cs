using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lexon.API.IntegrationsEvents.Events
{

    public class AssociateMailToFileIntegrationEvent : AssociateMailBaseIntegrationEvent
    {
        public AssociateMailToFileIntegrationEvent(string userId, long fileId, string mailId)
            : base(userId, fileId, mailId)
        {
            AssociateType = "File";
        }
    }
}