namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{
    public class CenDocumentBase
    {
        public int? ConceptObjectId { get; set; }

        public int? DocumentObjectId { get; set; }

        public string Name { get; set; }

        public string Source { get; set; }
        public string ContentType { get; set; }

        public string Status { get; set; }
    }

    public class CenDocumentContent
    {
        public string Name { get; set; }
        public string ContentFile { get; set; }
        public string IdUser { get; set; }

        public string ConceptId { get; set; }

    }
}