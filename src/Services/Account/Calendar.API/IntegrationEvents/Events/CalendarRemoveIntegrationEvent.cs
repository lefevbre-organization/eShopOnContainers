namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.IntegrationsEvents.Events
{
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public class CalendarRemoveIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }
        public short IdApp { get; set; }

        public CalendarRemoveIntegrationEvent(
            string user,
            short idApp)
        {
            User = user;
            IdApp = idApp;
        }
    }



}