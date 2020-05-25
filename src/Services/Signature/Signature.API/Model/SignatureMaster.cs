using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Signature.API.Model
{
    [BsonIgnoreExtraElements]
    public class SignatureMaster: MongoModel//, ISignatureList<SignatureEntityType>
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        //public string type { get; set; }
        //public short version { get; set; }

        //public long timeStamp { get; set; }
        //public SignatureEntityType[] list { get; set; }

        [BsonElement("externalId")]
        public string externalId { get; set; }

        [BsonElement("userId")]
        public string userId { get; set; }

        [BsonElement("app")]
        public string app { get; set; }
    }
}