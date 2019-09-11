namespace EmailUserAccount.API.IntegrationEvents
{
    #region Using

    using System.Threading.Tasks;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

    #endregion

    public interface IEmailUserAccountIntegrationEventService
    {
        Task SaveEventAndEmailUserAccountContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }
}