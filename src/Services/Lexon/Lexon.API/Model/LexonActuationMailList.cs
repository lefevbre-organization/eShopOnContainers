using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuationMailList : MongoModel
    {

        public string IdMail { get; set; }

        public LexonActuationList Classifications { get; set; }

    }
}