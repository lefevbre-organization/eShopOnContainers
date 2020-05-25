using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Signature.API.Model
{
    public abstract class MongoModel
    {
        [BsonExtraElements]
        public BsonDocument ExtraElements { get; set; }
    }
}