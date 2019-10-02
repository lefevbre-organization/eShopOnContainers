using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonCompaniesList : MongoModel, ILexonList<LexonCompany>
    {
        [BsonElement("timestamp")]
        public long TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonCompany[] List { get; set; }
    }
}