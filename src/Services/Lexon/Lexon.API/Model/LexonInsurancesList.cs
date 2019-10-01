using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonInsurancesList : MongoModel, ILexonList<LexonInsurance>
    {
        [BsonElement("timestamp")]
        public BsonTimestamp TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonInsurance[] List { get; set; }
    }
}