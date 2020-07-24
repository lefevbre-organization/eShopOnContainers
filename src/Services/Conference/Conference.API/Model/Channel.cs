namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class Channel
    {
        public string id { get; set; }

        public int expire { get; set; }
        public bool? initiator { get; set; }
        public string rtp_level_relay_type { get; set; }
        public string channel_bundle_id { get; set; }
        public string endpoint { get; set; }
        public string direction { get; set; }
        public int last_n { get; set; }

        public int[] sources { get; set; }
        public SsrcGroup[] ssrc_groups { get; set; }
        public PayloadType[] payload_types { get; set; }
        public RtpHdrexts[] rtp_hdrexts { get; set; }

        public SctpConnection[] sctpconnections { get; set; }
    }
}