using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.IntegrationsEvents.Events
{
    public record CreateGoogleDriveIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string GoogleDriveId { get; set; }

        public CreateGoogleDriveIntegrationEvent(
            string userId,
            string googleDriveId
            )
        {
            UserId = userId;
            GoogleDriveId = googleDriveId;
        }
    }

   
   
}