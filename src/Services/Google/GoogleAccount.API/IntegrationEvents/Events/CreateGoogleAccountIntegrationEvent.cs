using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.IntegrationsEvents.Events
{
    public class CreateGoogleAccountIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string GoogleDriveId { get; set; }

        public CreateGoogleAccountIntegrationEvent(
            string userId,
            string googleDriveId
            )
        {
            UserId = userId;
            GoogleDriveId = googleDriveId;
        }
    }



}