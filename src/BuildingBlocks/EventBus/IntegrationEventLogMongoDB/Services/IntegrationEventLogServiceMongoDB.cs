using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB.Services
{

    public class IntegrationEventLogServiceMongoDB : IIntegrationEventLogServiceMongoDB
    {
        public Task MarkEventAsFailedAsync(Guid eventId)
        {
            throw new NotImplementedException();
        }

        public Task MarkEventAsInProgressAsync(Guid eventId)
        {
            throw new NotImplementedException();
        }

        public Task MarkEventAsPublishedAsync(Guid eventId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<IntegrationEventLogEntry>> RetrieveEventLogsPendingToPublishAsync(Guid transactionId)
        {
            throw new NotImplementedException();
        }

        public Task SaveEventAsync(IntegrationEvent @event)
        {
            throw new NotImplementedException();
        }
    }
}