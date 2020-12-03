namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class ConferenceStats
    {
        public int inactive_endpoints { get; set; }
        public int inactive_conferences { get; set; }
        public int total_ice_succeeded_relayed { get; set; }
        public int total_loss_degraded_participant_seconds { get; set; }
        public string bit_rate_download { get; set; }


        //"bit_rate_download": 0.5,

        public int muc_clients_connected { get; set; }
        public int total_participants { get; set; }
        public long total_packets_received { get; set; }

        //"rtt_aggregate": 0.0,
        //"packet_rate_upload": 0,
        //"p2p_conferences": 0,
        //"total_loss_limited_participant_seconds": 0,
        //"octo_send_bitrate": 0,
        //"total_dominant_speaker_changes": 8,
        //"receive_only_endpoints": 0,
 
        //"octo_receive_bitrate": 0,
        //"version": "2.1.376-g9f12bfe2",

        //"total_bytes_sent_octo": 0,
        //"total_data_channel_messages_received": 0,
        //"bit_rate_upload": 0.5,
        public int total_ice_succeeded { get; set; }
        public int total_conferences_completed { get; set; }
        public int total_data_channel_messages_received { get; set; }
        public int total_colibri_web_socket_messages_sent { get; set; }
        public int total_colibri_web_socket_messages_received { get; set; }
        public long total_conference_seconds { get; set; }


        //"octo_conferences": 0,
        //"num_eps_no_msg_transport_after_delay": 5,
        //"endpoints_sending_video": 0,
        //"packet_rate_download": 0,
        //"muc_clients_configured": 1,
        //"outgoing_loss": 0.0,
        //"overall_loss": 0.0,
        //"conference_sizes": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        //"total_packets_sent_octo": 0,
        //"conferences_by_video_senders": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        //"stress_level": 0.0,
        //"jitter_aggregate": 0.0,
        //"total_ice_succeeded_tcp": 0,
        //"octo_endpoints": 0,
        public string current_timestamp { get; set; }

        //"total_packets_dropped_octo": 0,
        //"conferences": 0,
        //"participants": 0,
        //"largest_conference": 0,
        public long total_packets_sent { get; set; }

        //"total_data_channel_messages_sent": 0,
        //"incoming_loss": 0.0,
        //"total_bytes_received_octo": 0,
        //"octo_send_packet_rate": 0,
        //"conferences_by_audio_senders": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        public int total_conferences_created { get; set; }

        //"total_ice_failed": 0,
        //"total_packets_received_octo": 0,
        //"graceful_shutdown": false,
        //"octo_receive_packet_rate": 0,
        //"total_loss_controlled_participant_seconds": 91,
        //"total_partially_failed_conferences": 0,
        //"endpoints_sending_audio": 0,
        //"dtls_failed_endpoints": 0,
        public long total_bytes_sent { get; set; }
        public long total_bytes_received { get; set; }
        //"mucs_configured": 1,
        //"total_failed_conferences": 0,
        //"mucs_joined": 1
        public string rtp_loss { get; set; }
        public int audiochannels { get; set; }
        public string bit_rate_upload { get; set; }
        public int conferences { get; set; }
        public int participants { get; set; }

        public int threads { get; set; }
        public int videochannels { get; set; }
    }
}