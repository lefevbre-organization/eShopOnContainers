using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonDocument : MongoModel, IEntity
    {
        public long id { get; set; }

        public string name { get; set; }
        public string description { get; set; }
    }
}