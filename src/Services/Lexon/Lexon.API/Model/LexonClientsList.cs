using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonClientsList : MongoModel, ILexonList<LexonClient>
    {
        [BsonElement("timestamp")]
        public long TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonClient[] List { get; set; }
    }
}