using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonCompany : MongoModel, IName
    {
        [BsonElement("idCompany")]
        public long IdCompany { get; set; }

        public string Name { get; set; }

        public string Logo { get; set; }
    }
}