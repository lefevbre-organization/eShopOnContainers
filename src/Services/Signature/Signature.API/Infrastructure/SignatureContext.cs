using Signature.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;

namespace Signature.API.Infrastructure
{
    //mirar https://www.mongodb.com/blog/post/working-with-mongodb-transactions-with-c-and-the-net-framework
    public class SignatureContext : IMongoDbContext, IIntegrationEventLogContextMongoDB
    {
        public IMongoDatabase Database { get; }
        public IClientSessionHandle Session { get; private set; }
        private readonly IMongoClient _client = null;
        private readonly List<Type> _eventTypes;
        //private readonly IEventBus _eventBus;
        private readonly IOptions<SignatureSettings> _settings;
        public readonly string _collection;

        public SignatureContext(
            IOptions<SignatureSettings> settings
            //IEventBus eventBus
            )
        {
            //_eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _settings = settings;
            _client = new MongoClient(settings.Value.ConnectionString);

            if (_client != null)
                Database = _client.GetDatabase(settings.Value.Database);

            _eventTypes = Assembly.Load(Assembly.GetEntryAssembly().FullName)
                .GetTypes()
                .Where(t => t.Name.EndsWith(nameof(IntegrationEvent), StringComparison.CurrentCulture))
                .ToList();

            ClassMapping();
        }

        //public SignatureContext()
        //{
        //    var settings = new MongoClientSettings
        //    {
        //        Servers = new[]
        //    {
        //            new MongoServerAddress("localhost", 37017),
        //            new MongoServerAddress("localhost", 37018),
        //            new MongoServerAddress("localhost", 37019)
        //        },
        //        ConnectionMode = ConnectionMode.ReplicaSet,
        //        ReadPreference = ReadPreference.Primary
        //    };

        //    _client = new MongoClient(settings);
        //    Database = _client.GetDatabase("usersystem");
        //    ClassMapping();

        //}

        private static void ClassMapping()
        {
            //if (!BsonClassMap.IsClassMapRegistered(typeof(IntegrationEventLogEntry))) { BsonClassMap.RegisterClassMap<IntegrationEventLogEntry>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(SignatureUser))) { BsonClassMap.RegisterClassMap<SignatureUser>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(LexUser))) { BsonClassMap.RegisterClassMap<LexUser>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(SignatureMaster))) { BsonClassMap.RegisterClassMap<SignatureMaster>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(Signatures))) { BsonClassMap.RegisterClassMap<Signatures>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(UserSignatures))) { BsonClassMap.RegisterClassMap<UserSignatures>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(BaseBrandings))) { BsonClassMap.RegisterClassMap<BaseBrandings>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(UserEmails))) { BsonClassMap.RegisterClassMap<UserEmails>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(UserSms))) { BsonClassMap.RegisterClassMap<UserSms>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(SignEventInfo))) { BsonClassMap.RegisterClassMap<SignEventInfo>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(EmailEventInfo))) { BsonClassMap.RegisterClassMap<EmailEventInfo>(); }
            if (!BsonClassMap.IsClassMapRegistered(typeof(SmsEventInfo))) { BsonClassMap.RegisterClassMap<SmsEventInfo>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(Signature.API.Model.EventInfo))) { BsonClassMap.RegisterClassMap<Signature.API.Model.EventInfo>(); }
        }

        //public IMongoCollection<SignatureUser> SignatureUsers
        //{
        //    get { return Database.GetCollection<SignatureUser>(_settings.Value.Collection); }
        //}

        public IMongoCollection<LexUser> LexUsers
        {
            get { return Database.GetCollection<LexUser>(_settings.Value.CollectionSignatures); }
        }

        public IMongoCollection<LexUser> LexUsersTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<LexUser>(_settings.Value.CollectionSignatures);
        }

        //public IMongoCollection<SignatureUser> SignatureUsersTransaction(IClientSessionHandle session)
        //{
        //    return session.Client.GetDatabase(_settings.Value.Database).GetCollection<SignatureUser>(_settings.Value.Collection);
        //}

        public IMongoCollection<UserSignatures> Signatures => Database.GetCollection<UserSignatures>(_settings.Value.CollectionSignatures);
        
        public IMongoCollection<Signatures> SignaturesTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<Signatures>(_settings.Value.CollectionSignatures);
        }

        public IMongoCollection<BaseBrandings> Brandings => Database.GetCollection<BaseBrandings>(_settings.Value.CollectionBrandings);

        public IMongoCollection<BaseBrandings> BrandingsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<BaseBrandings>(_settings.Value.CollectionBrandings);
        }

        public IMongoCollection<SignEventInfo> SignatureEvents => Database.GetCollection<SignEventInfo>(_settings.Value.CollectionSignatureEvents);

        public IMongoCollection<SignEventInfo> EventsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<SignEventInfo>(_settings.Value.CollectionSignatureEvents);
        }

        public IMongoCollection<EmailEventInfo> EmailEvents => Database.GetCollection<EmailEventInfo>(_settings.Value.CollectionEmailEvents);

        public IMongoCollection<EmailEventInfo> EmailEventsTransaction => Database.GetCollection<EmailEventInfo>(_settings.Value.CollectionEmailEvents);

        public IMongoCollection<BaseBrandings> TestBrandings => Database.GetCollection<BaseBrandings>(_settings.Value.CollectionTest);

        public IMongoCollection<BaseBrandings> TestBrandingsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<BaseBrandings>(_settings.Value.CollectionTest);
        }

        public IMongoCollection<UserEmails> Emails => Database.GetCollection<UserEmails>(_settings.Value.CollectionEmails);

        public IMongoCollection<UserEmails> EmailsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<UserEmails>(_settings.Value.CollectionEmails);
        }

        public IMongoCollection<UserSms> Sms => Database.GetCollection<UserSms>(_settings.Value.CollectionSms);

        public IMongoCollection<UserSms> SmsTransaction(IClientSessionHandle session)
        {
            return session.Client.GetDatabase(_settings.Value.Database).GetCollection<UserSms>(_settings.Value.CollectionSms);
        }

        public IMongoCollection<SmsEventInfo> SmsEvents => Database.GetCollection<SmsEventInfo>(_settings.Value.CollectionSmsEvents);

        public IMongoCollection<SmsEventInfo> SmsEventsTransaction => Database.GetCollection<SmsEventInfo>(_settings.Value.CollectionSmsEvents);

        //public IMongoCollection<SignatureMaster> SignatureMasters
        //{
        //    get { return Database.GetCollection<SignatureMaster>(_settings.Value.CollectionMasters); }
        //}

        ////public IMongoCollection<SignatureMaster> SignatureMastersTransaction(IClientSessionHandle session)
        //{
        //    return session.Client.GetDatabase(_settings.Value.Database).GetCollection<SignatureMaster>(_settings.Value.CollectionMasters);
        //}

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
                //_eventBus.Publish(evt);
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