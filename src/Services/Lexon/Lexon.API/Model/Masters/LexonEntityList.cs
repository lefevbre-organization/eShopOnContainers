using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityList : MongoModel, ILexonList<LexonEntity>
    {
        public long timeStamp { get; set; }
        public LexonEntity[] list { get; set; }
    }
}