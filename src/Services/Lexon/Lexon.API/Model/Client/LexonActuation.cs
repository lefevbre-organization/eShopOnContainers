using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuation : MongoModel, IEntity
    {
        public long id { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public short idType { get; set; }
    }
}