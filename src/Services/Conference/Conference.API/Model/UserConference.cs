using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserConference : UserRoom
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string idNavision { get; set; }
        public short idApp { get; set; }

        public string url { get; set; }

        public Room[] rooms { get; set; }

        public ConferenceModel[] conferences { get; set; }
        public ConferenceStats[] stats { get; set; }
    }

    public class Room
    {
        /// <summary>
        /// url to use room
        /// </summary>
        public string url { get; set; }

        /// <summary>
        /// id of 10 chars generated in client
        /// </summary>
        public string id { get; set; }

        /// <summary>
        /// otinal pass to use de room
        /// </summary>
        public string pass { get; set; }

        /// <summary>
        /// guid generate by jitsi xmmp 
        /// </summary>
        public string guidJitsi { get; set; }

        /// <summary>
        /// id to locate de conference in stats
        /// </summary>
        public string restId { get; set; }

        /// <summary>
        /// date of creation in ticks 
        /// </summary>
        public string createdAt { get; set; }

        /// <summary>
        /// date of delete or remove of conference
        /// </summary>
        public string terminatedAt { get; set; }
    }
}