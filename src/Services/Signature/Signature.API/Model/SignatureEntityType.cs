using MongoDB.Bson.Serialization.Attributes;

namespace Signature.API.Model
{
    [BsonIgnoreExtraElements]
    public class SignatureEntityType : MongoModel
    {
        public long idEntity { get; set; }

        public string name { get; set; }

    }


}