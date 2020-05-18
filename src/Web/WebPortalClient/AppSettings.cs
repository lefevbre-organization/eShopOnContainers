namespace Lefebvre.eLefebvreOnContainers.Clients.WebPortalClient
{
    public class AppSettings
    {
        public string IdentityUrl { get; set; }
        public string PortalUrlHC { get; set; }
        public string LexonApiGatewayUrlHC { get; set; }
        public string AccountApiGatewayUrlHC { get; set; }

        public bool UseCustomizationData { get; set; }
    }
}