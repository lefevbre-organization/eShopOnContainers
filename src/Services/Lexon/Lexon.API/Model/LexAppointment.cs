namespace Lexon.API.Model
{
    public class LexAppointment
    {
        public int? Id { get; set; }

        public string Subject { get; set; }
        public string IdEvent { get; set; }
        public string Provider { get; set; }
        public string Location { get; set; }
        public string EndDate { get; set; }
        public string StartDate { get; set; }

        //'{"BBDD":"lexon_admin_02","IdUser":1344, "Subject":"test cita", "Location":"Madrid", "EndDate":"2020-03-30 20:31:30", "StartDate":"2020-03-28 20:31:30"}';
    }


}