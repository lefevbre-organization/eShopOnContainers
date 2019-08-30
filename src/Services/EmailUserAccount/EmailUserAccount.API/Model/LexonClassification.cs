using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonClassification : MongoModel
    {
        [BsonElement("idClassification")]
        public long IdClassification { get; set; }

        public string Type { get; set; }

        [BsonElement("idMail")]
        public string IdMail { get; set; }

        [BsonElement("idRelated")]
        public long IdRelated { get; set; }
    }
}