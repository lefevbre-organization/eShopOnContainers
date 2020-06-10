namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequestLogin : TokenRequest
    {
        public string Login { get; set; }

        public string Password { get; set; }

    }
}