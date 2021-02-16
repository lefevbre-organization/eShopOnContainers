using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public record DeleteRoomIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }
        public string RoomId { get; set; }

        public DeleteRoomIntegrationEvent(
            string user,
            short idApp,
            string roomId)
        {
            User = user;
            IdApp = idApp;
            RoomId = roomId;
        }
    }
}