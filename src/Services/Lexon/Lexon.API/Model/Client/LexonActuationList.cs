using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuationList : MongoModel, ILexonList<LexonActuation>
    {
        public long timeStamp { get; set; }

        public LexonActuation[] list { get; set; }
    }
}