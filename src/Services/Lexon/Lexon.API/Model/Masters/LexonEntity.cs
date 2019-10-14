using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntity : MongoModel
    {
        public long idEntity { get; set; }

        public string name { get; set; }

    }
}