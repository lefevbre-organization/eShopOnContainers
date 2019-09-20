using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonClassificationType : MongoModel
    {
        public long id { get; set; }

        public string name { get; set; }

    }
}