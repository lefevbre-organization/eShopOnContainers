using Autofac.Core;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserConference
    {
        public string idNavision { get; set; }

        public string idApp { get; set; }

        public ConferenceModel[] conferences { get; set; }
        public ConferenceStats[] stats { get; set; }
    }
}