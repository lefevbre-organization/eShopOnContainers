namespace Lexon.API.Model
{
    public class LexAppointment
    {
        public int? Id { get; set; }

        public string Subject { get; set; }
        public string Notes { get; set; }
        public short? AllDay { get; set; }
        public string IdEvent { get; set; }
        public string Provider { get; set; }
        public string Location { get; set; }
        public string Calendar { get; set; }
        public string Assistants { get; set; }
        public string EndDate { get; set; }
        public string StartDate { get; set; }
       
    }


}