using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonUser: MongoModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("idUser")]
        public string IdUser { get; set; }

        public string Name { get; set; }

        public LexonCompany[] Companies { get; set; }
        public LexonClient[] Clients { get; set; }
        public LexonClassification[] Classifications { get; set; }
        public LexonDocument[] Documents { get; set; }
        public LexonFile[] Files { get; set; }
        public LexonLawyer[] Lawyers { get; set; }
        public LexonSolicitor[] Solicitors { get; set; }
        public LexonNotary[] Notaries { get; set; }
        public LexonCourt[] Courts { get; set; }
    }
}