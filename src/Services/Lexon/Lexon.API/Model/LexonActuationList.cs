using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuationList : MongoModel, ILexonList<LexonActuation>
    {


        public string TimeStamp { get; set; }

        public LexonActuation[] List { get; set; }

    }
}