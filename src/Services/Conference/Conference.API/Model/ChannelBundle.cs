namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class ChannelBundle
    {
        public string id { get; set; }

        public Transport transport { get; set; }

        public string xmlns { get; set; }
        public string ufrag { get; set; }
        public bool? rtcp_mux { get; set; }
        public string pwd { get; set; }
        public Fingerprint[] fingerprints { get; set; }
    }
}