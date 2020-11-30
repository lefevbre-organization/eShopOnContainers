namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserConference : UserRoom
    {


        public ConferenceModel[] conferences { get; set; }
        public ConferenceStats[] stats { get; set; }
    }
}