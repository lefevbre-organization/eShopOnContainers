namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models
{
    public class CertificationFile
    {
        public string Guid { get; set; }
        public long DocumentId { get; set; }
        public string ContentFile { get; set; }
        public string Name { get; set; }
        public CenContact recipient { get; set; }
    }
}
