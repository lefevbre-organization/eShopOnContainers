using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    public abstract class MongoModel
    {
        [BsonIgnoreIfDefault]
        [BsonExtraElements]
        public BsonDocument ExtraElements { get; set; }
    }
}