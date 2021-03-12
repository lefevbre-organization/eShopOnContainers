namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class SignatureSettings: BaseSettings
    {
        public string CollectionSignatures { get; set; }
        public string CollectionBrandings { get; set; }
        public string CollectionSignatureEvents { get; set; }
        public string CollectionTest { get; set; }
        public string CollectionEmails { get; set; }
        public string CollectionEmailEvents { get; set; }
        public string CollectionSms { get; set; }
        public string CollectionSmsEvents { get; set; }
        public string CollectionDocuments { get; set; }

        public string LexonApiGwUrl { get; set; }

        public string CentinelaApiGwUrl { get; set; }
        public string ModulosComunes { get; set; }

        public string SignaturitApiUrl { get; set; }
        public string CallBackUrl { get; set; }
        public string SignatureNotificationUrl { get; set; }
        public string CertifiedEmailNotificationUrl { get; set; }
        public string CertifiedSmsNotificationUrl { get; set; }

    }
}