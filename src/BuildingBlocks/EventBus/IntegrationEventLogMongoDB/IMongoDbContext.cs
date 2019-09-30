﻿using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{
    public interface IMongoDbContext
    {
        IMongoDatabase Database { get; }

        IClientSessionHandle Session { get; }

        Task<IClientSessionHandle> StartSession(CancellationToken cancellactionToken = default(CancellationToken));
    }
}