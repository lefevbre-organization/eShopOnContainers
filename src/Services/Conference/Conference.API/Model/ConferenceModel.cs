namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class ConferenceModel : ConferenceSimple
    {
        public string name { get; set; }

        public Channel[] chanels { get; set; }

        public ChannelBundle[] channelBundles { get; set; }
    }
}