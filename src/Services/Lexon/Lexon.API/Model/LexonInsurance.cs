using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonInsurance : MongoModel, IEntity
    {
        public long idInsurance { get; set; }

        public string name { get; set; }
        public string description { get; set; }
    }
}