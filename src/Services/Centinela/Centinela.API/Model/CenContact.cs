namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{
    public class CenContact
    {
    
        public int? contactId { get; set; }
        public string name { get; set; }
        public string surname { get; set; }
        public string fullName { get; set; }
        public string companyName { get; set; }
        //public int? position { get; set; }
        public string phoneNumber1 { get; set; }
        public string phoneNumber2 { get; set; }
        public string address { get; set; }
        public string postalCode { get; set; }
        //public string city { get; set; }
        //public string province { get; set; }
        //public string country { get; set; }
        public string email { get; set; }

    }
}