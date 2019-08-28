using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonSolicitor : MongoModel, IOwn, IName
    {
        [BsonElement("idSolicitor")]
        public int IdSolicitor { get; set; }

        [BsonElement("Propio")]
        public bool Own { get; set; }

        public string Name { get; set; }
    }
}