namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class Room
    {
        /// <summary>
        /// url to use room
        /// </summary>
        public string url { get; set; }

        /// <summary>
        /// name  of the room
        /// </summary>
        public string name { get; set; }

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