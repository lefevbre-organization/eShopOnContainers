using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuation : MongoModel
    {
        [BsonElement("idClassification")]
        public long IdClassification { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Type { get; set; }
    }
}