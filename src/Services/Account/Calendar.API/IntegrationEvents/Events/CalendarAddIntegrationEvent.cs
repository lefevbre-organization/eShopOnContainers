namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.IntegrationsEvents.Events
{
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public record CalendarAddIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string GoogleDriveId { get; set; }

        public CalendarAddIntegrationEvent(
            string userId,
            string googleDriveId
            )
        {
            UserId = userId;
            GoogleDriveId = googleDriveId;
        }
    }



}