using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public record CreateRoomIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }
        public Room RoomData { get; set; }

        public CreateRoomIntegrationEvent(
            string user,
            short idApp,
            Room room)
        {
            User = user;
            IdApp = idApp;
            RoomData = room;
        }
    }
}