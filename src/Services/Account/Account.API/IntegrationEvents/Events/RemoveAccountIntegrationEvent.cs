namespace Account.API.IntegrationEvents.Events
{


    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    public class RemoveAccountIntegrationEvent : IntegrationEvent
    {
        public string User { get; set; }

        public string Provider { get; set; }

        public string Email { get; set; }



        public RemoveAccountIntegrationEvent(
            string user,
            string provider,
            string email
            )
        {
            User = user;
            Provider = provider;
            Email = email;
        }
    }
}
