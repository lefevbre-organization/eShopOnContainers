namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class SctpConnection
    {
        public string id { get; set; }
        public long? expire { get; set; }
        public bool? initiator { get; set; }
        public string endpoint { get; set; }
        public int? port { get; set; }
        public string channel_bundle_id { get; set; }

    }
}