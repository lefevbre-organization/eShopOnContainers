using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonClient : MongoModel, IName
    {
        [BsonElement("idClient")]
        public int IdClient { get; set; }

        public string Name { get; set; }

        public string Tlf { get; set; }
    }
}