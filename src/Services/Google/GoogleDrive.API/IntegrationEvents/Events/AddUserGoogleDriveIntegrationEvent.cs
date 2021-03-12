using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.IntegrationsEvents.Events
{
    public record AddUserGoogleDriveIntegrationEvent : IntegrationEvent
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