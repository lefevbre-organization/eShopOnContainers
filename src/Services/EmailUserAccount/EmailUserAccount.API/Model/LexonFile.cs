using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonFile : MongoModel, IDoc, IName
    {
        [BsonElement("idFile")]
        public long IdFile { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
    }
}