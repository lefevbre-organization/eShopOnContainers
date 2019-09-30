using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonFile : MongoModel, IDoc, IName, ILexonFile
    {
        [BsonElement("idFile")]
        public long IdFile { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        [BsonElement("mails")]
        public string[] Mails { get; set; }
    }
}