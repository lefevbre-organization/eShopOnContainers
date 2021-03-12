using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public record ManageRoomIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }
        public Room RoomData { get; set; }
        public Room RoomDataOld { get; set; }

        public ManageRoomIntegrationEvent(
            string user,
            short idApp,
            Room room,
            Room oldRoom)
        {
            User = user;
            IdApp = idApp;
            RoomData = room;
            RoomDataOld = oldRoom;
        }
    }
}