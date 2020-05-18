namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{
    public class CenDocumentObject : CenDocumentBase
    {
        public int? documentId { get; set; }
        public string extension { get; set; }
        public long fileSize { get; set; }
        public string created { get; set; }
        public string createdBy { get; set; }
        public string editPath { get; set; }
        public string sourceName { get; set; }
        public int documentStatusId { get; set; }
        public string modifiedBy { get; set; }
        public string modified { get; set; }
        public bool canBeDeleted { get; set; }
        public bool confidential { get; set; }
    }
}