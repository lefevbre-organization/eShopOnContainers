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

    public class LexAction
    {
        public string IdType { get; set; }
        public string IdCategory { get; set; }
        public string Issue { get; set; }
        public string Description { get; set; }
        public string StartDateFrom { get; set; }
        public string StartDatetTo { get; set; }
        public string Last { get; set; }
        public string Billable { get; set; }
        public string IdStatus { get; set; }
        public string Direction { get; set; }
        public string PresentationDate { get; set; }
        public string ExpirationDate { get; set; }
        public string EconomicEstimate { get; set; }
        public string IdAppointment { get; set; }
        public string Related { get; set; }
        public string ContactsRelations { get; set; }
        public string FilesRelation { get; set; }
        public string Uid { get; set; }
        public string Public { get; set; }
        public string IdCompany { get; set; }
        public string IdRate { get; set; }
        public string Folder_id { get; set; }
        public string IdLexnet { get; set; }

        public LexRelation[] Relations {get; set;}

        //'{"BBDD":"lexon_admin_02","IdUser":1344,"idType":"REUN","idCategory":"1","issue":"reunión","description":"nueva act desde correo","startDateFrom":"2019-07-30",
//"startDatetTo":"2019-07-31","last":"30","billable":"0","idStatus":"1","direction":"","PresentationDate":null,"expirationDate":"","economicEstimate":"","idAppointment":"",
//"related":"","contactsRelations":"","filesRelation":"","uid":"1234","idUser":"1344","Public":"0","idCompany":"88","idRate":null,"folder_id":"","idLexnet":"123",
//"relations":[{"idEntityRelation":8,"idEntityTypeRelation":2},{"idEntityRelation":7,"idEntityTypeRelation":2}]}';
    }

    public class LexRelation
    {
        public int idEntityRelation { get; set; }
        public int idEntityTypeRelation { get; set; }

    }
}