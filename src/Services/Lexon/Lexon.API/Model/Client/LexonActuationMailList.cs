using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuationMailList : MongoModel
    {

        public string idMail { get; set; }

        public LexonActuationList classifications { get; set; }

    }
}