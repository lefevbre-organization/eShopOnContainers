using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonLawyer : MongoModel, IOwn, IName
    {
        [BsonElement("idLawyer")]
        public int IdLawyer { get; set; }

        [BsonElement("Propio")]
        public bool Own { get; set; }

        public string Name { get; set; }
    }
}