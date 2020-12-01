using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class Channel
    {
        public string id { get; set; }

        public long? expire { get; set; }
        public bool? initiator { get; set; }
        public string rtp_level_relay_type { get; set; }
        [JsonProperty("channel-bundle-id")]
        public string channel_bundle_id { get; set; }
        public string endpoint { get; set; }
        public string direction { get; set; }
        public long? last_n { get; set; }

        public long[] sources { get; set; }
        public SsrcGroup[] ssrc_groups { get; set; }
        public PayloadType[] payload_types { get; set; }
        public RtpHdrexts[] rtp_hdrexts { get; set; }

        public SctpConnection[] sctpconnections { get; set; }
    }
}