namespace Account.API.Infrastructure
{
    #region

    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson.Serialization;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Configuration;

    #endregion

    //TODO: https://www.mongodb.com/blog/post/working-with-mongodb-transactions-with-c-and-the-net-framework

    public class AccountContext : IMongoDbContext, IIntegrationEventLogContextMongoDB
    {
        public IMongoDatabase Database { get; }
        public IClientSessionHandle Session { get; private set; }
        private readonly IMongoClient _client;
        private readonly List<Type> _eventTypes;
        private readonly IEventBus _eventBus;
        private readonly IOptions<AccountSettings> _settings;

        public AccountContext(
            IOptions<AccountSettings> settings,
            IEventBus eventBus,
            IConfiguration configuration)
        {
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _settings = settings;
            _client = new MongoClient(settings.Value.ConnectionString);
            if (_client != null)
                Database = _client.GetDatabase(settings.Value.Database);

            _eventTypes = Assembly.Load(Assembly.GetEntryAssembly()?.FullName ?? throw new InvalidOperationException())
                .GetTypes()
                .Where(t => t.Name.EndsWith(nameof(IntegrationEvent), StringComparison.CurrentCulture))
                .ToList();

            ClassMapping();
        }

        private static void ClassMapping()
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(IntegrationEventLogEntry))) { BsonClassMap.RegisterClassMap<IntegrationEventLogEntry>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(UserMail))) { BsonClassMap.RegisterClassMap<UserMail>(); }
        }

        public IMongoCollection<UserMail> Accounts => Database.GetCollection<UserMail>(_settings.Value.Collection);

        public IMongoCollection<UserMail> AccountsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<UserMail>(_settings.Value.Collection);
        }

        public IMongoCollection<IntegrationEventLogEntry> IntegrationEventLogs
        {
            get { return Database.GetCollection<IntegrationEventLogEntry>(_settings.Value.CollectionEvents); }
        }

        public IMongoCollection<IntegrationEventLogEntry> IntegrationEventLogsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<IntegrationEventLogEntry>(_settings.Value.CollectionEvents);
        }

        public async Task PublishThroughEventBusAsync(IntegrationEvent evt, IClientSessionHandle session)
        {
            try
            {
                await MarkEventAsInProgressAsync(evt.Id, session);
                _eventBus.Publish(evt);
                await MarkEventAsPublishedAsync(evt.Id, session);
            }
            catch (Exception)
            {
                await MarkEventAsFailedAsync(evt.Id, session);
            }
        }

        private Task UpdateEventStatus(Guid eventId, EventStateEnum status, IClientSessionHandle session)
        {
            var filter = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.EventId, eventId);

            var eventLogEntry = IntegrationEventLogsTransaction(session).Find(filter).Single();

            var builder = Builders<IntegrationEventLogEntry>.Update;
            var update = builder.Set(u => u.State, status);

            if (status == EventStateEnum.InProgress)
                eventLogEntry.TimesSent++;

            return IntegrationEventLogsTransaction(session).UpdateOneAsync(filter, update);
        }

        //private Task UpdateEventStatusInDocument(Guid eventId, EventStateEnum status, IClientSessionHandle session)
        //{
        //    var filter = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.EventId, eventId);

        //    var eventLogEntry = IntegrationEventLogsTransaction(session).Find(filter).Single();

        //    var builder = Builders<IntegrationEventLogEntry>.Update;
        //    var update = builder.Set(u => u.State, status);

        //    if (status == EventStateEnum.InProgress)
        //        eventLogEntry.TimesSent++;

        //    return IntegrationEventLogsTransaction(session).UpdateOneAsync(filter, update);
        //}

        public async Task<IEnumerable<IntegrationEventLogEntry>> RetrieveEventLogsPendingToPublishAsync(Guid transactionId)
        {
            var builder = Builders<IntegrationEventLogEntry>.Filter;
            var filter = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.State, EventStateEnum.NotPublished);
            var filterEvent = Builders<IntegrationEventLogEntry>.Filter.In(u => u.EventTypeShortName, _eventTypes.Select(e => e.Name));
            var filterTransaction = Builders<IntegrationEventLogEntry>.Filter.Eq(u => u.TransactionId, transactionId.ToString());
            var finalFilter = builder.And(filter, filterEvent, filterTransaction);

            var sort = Builders<IntegrationEventLogEntry>.Sort.Descending(u => u.CreationTime);
            return await IntegrationEventLogs
                .Find(finalFilter)
                .Sort(sort)
                .ToListAsync();
        }

        public Task MarkEventAsInProgressAsync(Guid eventId, IClientSessionHandle transaction)
        {
            return UpdateEventStatus(eventId, EventStateEnum.InProgress, transaction);
        }

        public Task MarkEventAsPublishedAsync(Guid eventId, IClientSessionHandle transaction)
        {
            return UpdateEventStatus(eventId, EventStateEnum.Published, transaction);
        }

        public Task MarkEventAsFailedAsync(Guid eventId, IClientSessionHandle transaction)
        {
            return UpdateEventStatus(eventId, EventStateEnum.PublishedFailed, transaction);
        }

        public async Task<IClientSessionHandle> StartSession(CancellationToken cancellactionToken = default(CancellationToken))
        {
            var session = await _client.StartSessionAsync(cancellationToken: cancellactionToken);
            Session = session;
            return session;
        }

        public Task SaveEventAsync(IntegrationEvent @event, IClientSessionHandle transaction)
        {
            throw new NotImplementedException();
        }
    }
}