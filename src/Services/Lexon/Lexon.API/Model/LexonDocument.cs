using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonDocument : MongoModel, IName, IDoc
    {
        [BsonElement("idDocument")]
        public long IdDocument { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
    }



}
