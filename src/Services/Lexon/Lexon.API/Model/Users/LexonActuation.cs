using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuation //: MongoModel //, IEntity
    {
        public string idMail { get; set; }

        public long idRelated { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string entityType { get; set; }

        public short entityIdType { get; set; }
    }
}