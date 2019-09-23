using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonSupplier : MongoModel, IName
    {
        [BsonElement("idSupplier")]
        public long IdSupplier { get; set; }

        public string Name { get; set; }
    }
}