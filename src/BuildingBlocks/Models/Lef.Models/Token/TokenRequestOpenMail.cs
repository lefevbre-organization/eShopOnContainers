namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequestOpenMail: TokenRequestNewMail
    {
        public string idMail { get; set; }
        public string provider { get; set; }
        public string mailAccount { get; set; }
        public string folder { get; set; }
    }
}