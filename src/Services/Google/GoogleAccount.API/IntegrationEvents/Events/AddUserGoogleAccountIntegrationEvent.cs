using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.IntegrationsEvents.Events
{
    public class AddUserGoogleAccountIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }

        public AddUserGoogleAccountIntegrationEvent(
            string user,
            short idApp)
        {
            User = user;
            IdApp = idApp;
        }
    }



}