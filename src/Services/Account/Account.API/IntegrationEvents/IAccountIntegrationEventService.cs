namespace Account.API.IntegrationEvents
{
    #region Using

    using System.Threading.Tasks;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    #endregion

    public interface IAccountIntegrationEventService
    {
        Task SaveEventAndAccountContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }
}