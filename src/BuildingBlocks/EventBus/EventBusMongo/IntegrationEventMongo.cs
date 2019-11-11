using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events
{

    /// <summary>
    /// IntegrationEvent use in MongoDb implementations
    /// Need a BsonId instead Guid
    /// </summary>
    public class IntegrationEventMongo : IntegrationEvent
    {
        public IntegrationEventMongo()
        {
            Id = new BsonObjectId(ObjectId.GenerateNewId()).ToString();
            CreationDate = DateTime.UtcNow;
        }

        [JsonConstructor]
        public IntegrationEventMongo(BsonObjectId id, DateTime createDate)
        {
            Id = id.ToString();
            CreationDate = createDate;
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public new string Id { get; private set; }
    }
}
