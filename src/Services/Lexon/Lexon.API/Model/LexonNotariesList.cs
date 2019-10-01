using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonNotariesList : MongoModel, ILexonList<LexonNotary>
    {
        [BsonElement("timestamp")]
        public BsonTimestamp TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonNotary[] List { get; set; }
    }
}