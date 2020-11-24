namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class UserConference
    {
        public string idNavision { get; set; }

        public string idApp { get; set; }

        public ConferenceModel[] conferences { get; set; }
        public ConferenceStats[] stats { get; set; }
    }

    public class UserReservation : UserReservationRequest
    {
        public long id { get; set; } //': 364758328,
        public long duration { get; set; } //  'duration': 900000
    }

    public class UserReservationRequest
    {
        public string name { get; set; }
        public string mail_owner { get; set; }
        public string start_time { get; set; } //  'start_time': '2048-04-20T17:55:12.000Z',
    }
}