using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogEF;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB.Services
{

    public class IntegrationEventLogServiceMongoDB : IIntegrationEventLogServiceMongoDB
    {
        private readonly IntegrationEventLogContextMongoDB _integrationEventLogContext;
        private readonly List<Type> _eventTypes;

        public IntegrationEventLogServiceMongoDB(
            IOptions<IntegrationEventLogSettings> settings
            )
        {
            _integrationEventLogContext = new IntegrationEventLogContextMongoDB(settings);

            _eventTypes = Assembly.Load(Assembly.GetEntryAssembly().FullName)
                .GetTypes()
                .Where(t => t.Name.EndsWith(nameof(IntegrationEvent)))
                .ToList();
        }

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

        public async Task<IEnumerable<IntegrationEventLogEntry>> RetrieveEventLogsPendingToPublishAsync(Guid transactionId)
        {
            var builder = Builders<IntegrationEventLogEntry>.Filter;
            var filter = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.State, EventStateEnum.NotPublished);
            var filterEvent = Builders<IntegrationEventLogEntry>.Filter.In(u => u.EventTypeShortName, _eventTypes.Select(e => e.Name));
            var filterTransaction = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.TransactionId, transactionId.ToString());
            var finalFilter = builder.And(filter, filterEvent, filterTransaction);

            var sort = Builders<IntegrationEventLogEntry>.Sort.Descending(u => u.CreationTime);
            return await _integrationEventLogContext.IntegrationEventLogs
                .Find(finalFilter)
                .Sort(sort)
                .ToListAsync();
        }

        public Task SaveEventAsync(IntegrationEvent @event)
        {
            throw new NotImplementedException();
        }
    }
}