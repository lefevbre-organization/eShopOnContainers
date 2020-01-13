using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonEntityBase //: MongoModel
    {
        public long id { get; set; }
        public short idType { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string[] mails { get; set; }
    }
}