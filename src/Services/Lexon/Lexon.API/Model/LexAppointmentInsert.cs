namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Models
{
    public class LexAppointmentInsert: LexAppointment
    {
        public string IdEvent { get; set; }
        public string Provider { get; set; }
        public Reminder Reminder { get; set; }
        public EventType EventType { get; set; }
        public new Calendar Calendar { get; set; }

    }
}