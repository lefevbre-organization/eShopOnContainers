using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonSupplier : MongoModel, IEntity
    {
        public long idSupplier { get; set; }

        public string name { get; set; }
        public string description { get; set; }
    }
}