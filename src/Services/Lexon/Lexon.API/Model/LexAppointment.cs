namespace Lexon.API.Model
{
    public class LexAppointment
    {
        public string Bbdd { get; set; }
        public string Subject { get; set; }
        public string Provider { get; set; }
        public string Location { get; set; }
        public string EndDate { get; set; }
        public string StartDate { get; set; }

        //'{"BBDD":"lexon_admin_02","IdUser":1344, "Subject":"test cita", "Location":"Madrid", "EndDate":"2020-03-30 20:31:30", "StartDate":"2020-03-28 20:31:30"}';
    }

    public class LexAppointmentSimple
    {
        public string Bbdd { get; set; }

        public int Id { get; set; }

        //'{"BBDD":"lexon_admin_02","Id":401, "IdUser":"1344"}';
    }

    public class LexAppointmentActuation: LexAppointmentSimple
    {
        public int IdAppointment { get; set; }

    }
}