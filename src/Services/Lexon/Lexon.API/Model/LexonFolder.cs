using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonFolder : MongoModel, IName
    {
        [BsonElement("idFolder")]
        public long IdFolder { get; set; }

        public string Name { get; set; }

        public string Path { get; set; }

        public LexonDocumentsList Documents { get; set; }
    }
}