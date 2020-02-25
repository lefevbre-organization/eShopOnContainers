using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public abstract class MongoModel
    {
        [BsonExtraElements]
        public BsonDocument ExtraElements { get; set; }
    }
}