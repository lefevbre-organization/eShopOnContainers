using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events
{
    public abstract class AssociateMailBaseIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public long AssociatedId { get; set; }

        public string MailId { get; set; }

        public string AssociateType { get; protected set; }

        protected AssociateMailBaseIntegrationEvent(
            string userId,
            long associatedId,
            string mailId
            )
        {
            UserId = userId;
            AssociatedId = associatedId;
            MailId = mailId;
        }
    }
}