namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class PayloadType
    {
        public string id { get; set; }
        public string name { get; set; }
        public string clockrate { get; set; }
        public string channels { get; set; }

        public Parameters parameters { get; set; }

        public RctpFbs[] rctp_fbs { get; set; } 

    }
}