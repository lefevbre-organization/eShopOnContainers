using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityList : MongoModel, ILexonList<LexonEntity>
    {

        [BsonElement("timestamp")]
        public long TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonEntity[] List { get; set; }

    }
}