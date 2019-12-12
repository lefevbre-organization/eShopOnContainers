using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{
    /// <summary>
    /// Similar to the implementation with EF without coupled to EF connection
    /// </summary>
    public interface IIntegrationEventLogContextMongoDB
    {
        Task<IEnumerable<IntegrationEventLogEntry>> RetrieveEventLogsPendingToPublishAsync(Guid transactionId);

        Task SaveEventAsync(IntegrationEvent @event, IClientSessionHandle transaction);

        Task MarkEventAsPublishedAsync(Guid eventId, IClientSessionHandle transaction);

        Task MarkEventAsInProgressAsync(Guid eventId, IClientSessionHandle transaction);

        Task MarkEventAsFailedAsync(Guid eventId, IClientSessionHandle transaction);
    }
}