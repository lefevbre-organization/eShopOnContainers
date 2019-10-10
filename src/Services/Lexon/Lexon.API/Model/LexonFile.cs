using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonFile : MongoModel, IEntity, IActuation
    {
        public long idFile { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string[] mails { get; set; }
    }
}