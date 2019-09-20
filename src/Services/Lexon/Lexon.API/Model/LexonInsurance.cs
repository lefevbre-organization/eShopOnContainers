using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonInsurance : MongoModel, IName
    {
        [BsonElement("idInsurance")]
        public long IdInsurance { get; set; }

        public string Name { get; set; }
    }
}