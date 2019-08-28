using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonNotary : MongoModel, IName
    {
        [BsonElement("idNotary")]
        public int IdNotary { get; set; }

        public string Name { get; set; }
    }
}