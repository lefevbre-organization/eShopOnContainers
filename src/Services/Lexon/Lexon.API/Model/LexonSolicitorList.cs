using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonSolicitorList : MongoModel, ILexonList<LexonSolicitor>
    {
        [BsonElement("timestamp")]
        public BsonTimestamp TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonSolicitor[] List { get; set; }
    }
}