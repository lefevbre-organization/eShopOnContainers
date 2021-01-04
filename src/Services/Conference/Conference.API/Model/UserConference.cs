using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserConference 
    {
        public UserConference()
        { }

        public UserConference(string idNavisionUser, short idApplication)
        {
            idNavision = idNavisionUser;
            idApp = idApplication;
            rooms = new Room[] { };
            conferences = new ConferenceModel[] { };
            stats = new ConferenceStats[] { };
        }

        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string idNavision { get; set; }
        public short idApp { get; set; }

        //public string url { get; set; }

        public Room[] rooms { get; set; }

        public ConferenceModel[] conferences { get; set; }
        public ConferenceStats[] stats { get; set; }
    }
}