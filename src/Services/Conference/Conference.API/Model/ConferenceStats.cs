namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class ConferenceStats
    {
        public string rtp_loss { get; set; }
        public string bit_rate_download { get; set; }
        public int audiochannels { get; set; }
        public string bit_rate_upload { get; set; }
        public int conferences { get; set; }
        public int participants { get; set; }

        public string current_timestamp { get; set; }
        public int threads { get; set; }
        public int videochannels { get; set; }
    }
}