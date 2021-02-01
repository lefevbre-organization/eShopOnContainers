using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Model
{
    public class CalendarUser
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string idNavision { get; set; }
        public string idNextCloud { get; set; }
        public string passNextCloud { get; set; }

        public Calendar[] calendars { get; set; }

    }
}