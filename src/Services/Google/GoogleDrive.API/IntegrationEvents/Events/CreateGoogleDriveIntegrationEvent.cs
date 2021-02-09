using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.IntegrationsEvents.Events
{
    public class CreateGoogleDriveIntegrationEvent : IntegrationEvent
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

    public class AddUserGoogleDriveIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }

        public AddUserGoogleDriveIntegrationEvent(
            string user,
            short idApp)
        {
            User = user;
            IdApp = idApp;
        }
    }

   
   
}