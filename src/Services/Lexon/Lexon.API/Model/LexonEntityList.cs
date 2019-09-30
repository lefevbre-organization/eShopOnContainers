using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityList : MongoModel, ILexonList<LexonEntity>
    {

        public string TimeStamp { get; set; }

        [BsonElement("list")]
        public LexonEntity[] List { get; set; }

    }
}