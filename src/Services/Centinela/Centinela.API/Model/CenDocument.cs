namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{

    public class CenDocument : CenDocumentBase
    {
        public string ProductId { get; set; }

        public string ProductName { get; set; }

        public long? EvaluationId { get; set; }

        public string EvaluationName { get; set; }

        public int? ClientId { get; set; }

        public int? ReportDocumentId { get; set; }

        public int? ReportObjectId { get; set; }

        public int? ReportId { get; set; }

        public string ReportType { get; set; }

        public long? FolderId { get; set; }

        public string FolderName { get; set; }

        public int? ConceptId { get; set; }

        public string ConceptObjectName { get; set; }

        public string ClientName { get; set; }

        public int? TaskId { get; set; }

        public string Participants { get; set; }

        public string LcoFields { get; set; }

        public string StringFields { get; set; }

        //"Format": "Documento Word",
        public string Format { get; set; }

        //"TaskType": null,
        public string TaskType { get; set; }

        public string Author { get; set; }

        //"CreationDate": "2020-03-18T10:35:28.093",
        public string CreationDate { get; set; }
    }

    public class ListaDocumentos
    {
        public CenDocumentsList Documents { get; set; }
    }

    public class CenDocumentsList
    {
        public CenDocument[] Results { get; set; }
    }
}