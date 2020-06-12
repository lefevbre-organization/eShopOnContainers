namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequestLogin : TokenRequest
    {
        public string login { get; set; }

        public string password { get; set; }

    }
}