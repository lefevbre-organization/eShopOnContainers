using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonSolicitor : MongoModel, IEntity
    {
        public long id { get; set; }

        public string description { get; set; }

        public string name { get; set; }
    }
}