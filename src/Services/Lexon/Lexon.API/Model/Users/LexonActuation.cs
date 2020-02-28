using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuation : MongoModel //, IEntity
    {
        public string entityType { get; set; }

        public string idMail { get; set; }

        //public long id { get; set; }
        public long idRelated { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public short entityIdType { get; set; }

        public string date { get; set; }
       // public string intervening { get; set; }
    }
}