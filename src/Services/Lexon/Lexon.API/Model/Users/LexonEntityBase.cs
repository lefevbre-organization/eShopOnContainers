using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityBase: MongoModel
    {
        public long id { get; set; }
        public short idType { get; set; }
        public string entityType { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string intervening { get; set; }

        public string[] mails { get; set; }
        public string email { get; set; }
    }
}