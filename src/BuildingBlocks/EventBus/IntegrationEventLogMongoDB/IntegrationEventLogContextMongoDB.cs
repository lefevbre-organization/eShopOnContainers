using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{

    public class IntegrationEventLogContextMongoDB: IMongoDbContext
    {
        public IMongoDatabase Database { get; }

        public IClientSessionHandle Session { get; private set; }

        private IMongoClient _client;

        public IntegrationEventLogContextMongoDB()
        {
            var settings = new MongoClientSettings
            {
                Servers = new[]
    {
                    new MongoServerAddress("localhost", 37017),
                    new MongoServerAddress("localhost", 37018),
                    new MongoServerAddress("localhost", 37019)
                },
                ConnectionMode = ConnectionMode.ReplicaSet,
                ReadPreference = ReadPreference.Primary
            };

            _client = new MongoClient(settings);
            Database = _client.GetDatabase("usersystem");
            ClassMapping();

        }

        private static void ClassMapping()
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(IntegrationEventLogEntry))) { BsonClassMap.RegisterClassMap<IntegrationEventLogEntry>(); }
            //if (!BsonClassMap.IsClassMapRegistered(typeof(UserActivatedAccountEvent))) { BsonClassMap.RegisterClassMap<UserActivatedAccountEvent>(); }
        }

        public IntegrationEventLogContextMongoDB(IOptions<IntegrationEventLogSettings> settings)
        {
            _client = new MongoClient(settings.Value.ConnectionString);
            if (_client != null)
                Database = _client.GetDatabase(settings.Value.Database);
        }

        public IMongoCollection<IntegrationEventLogEntry> IntegrationEventLogs
        {
            get { return Database.GetCollection<IntegrationEventLogEntry>("IntegrationEventLog"); }
        }

        public async Task<IClientSessionHandle> StartSession(CancellationToken cancellactionToken = default(CancellationToken))
        {
            var session = await _client.StartSessionAsync(cancellationToken: cancellactionToken);
            Session = session;
            return session;
        }
    }
}
