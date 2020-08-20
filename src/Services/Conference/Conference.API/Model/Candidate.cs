namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models
{
    public class Candidate
    {
        public int generation { get; set; }
        public int component { get; set; }
        public string protocol { get; set; }
        public int port { get; set; }
        public string ip { get; set; }
        public string tcptype { get; set; }
        public string foundation { get; set; }
        public string id { get; set; }
        public long priority { get; set; }
        public string type { get; set; }
        public int network { get; set; }
    }
}