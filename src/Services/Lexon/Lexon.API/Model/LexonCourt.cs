using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonCourt : MongoModel, IName
    {
        [BsonElement("idCourt")]
        public long IdCourt { get; set; }

        public string Name { get; set; }
    }
}