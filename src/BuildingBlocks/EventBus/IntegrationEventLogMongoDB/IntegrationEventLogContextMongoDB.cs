using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{
    public class IntegrationEventLogContextMongoDB
    {
        public IMongoDatabase Database { get; }

        public IClientSessionHandle Session { get; private set; }

        private IMongoClient _client;

        public IntegrationEventLogContextMongoDB()
        {

        }
    }
}
