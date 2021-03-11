using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public abstract class MongoModel
    {
        [BsonExtraElements]
        public BsonDocument ExtraElements { get; set; }
    }
}