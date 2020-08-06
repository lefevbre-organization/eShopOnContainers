using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Account.API.Model
{
 

    public class AccountEvents
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string email { get; set; }

        public EventType[] events { get; set; }

    }
}