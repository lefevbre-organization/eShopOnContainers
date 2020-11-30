using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.IntegrationsEvents.Events
{
    public class CreateConferenceIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string ConferenceId { get; set; }

        public CreateConferenceIntegrationEvent(
            string userId,
            string conferenceId
            )
        {
            UserId = userId;
            ConferenceId = conferenceId;
        }
    }

    public class AddUserConferenceIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }

        public AddUserConferenceIntegrationEvent(
            string user,
            short idApp)
        {
            User = user;
            IdApp = idApp;
        }
    }

    public class ManageRoomIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }
        public Room RoomData { get; set; }

        public ManageRoomIntegrationEvent(
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