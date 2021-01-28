using Google.Models.Enumerators;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Models
{
    public class CreateCredentialRequest
    {
        public GoogleProduct Product { get; set; }
        public string GoogleMailAccount { get; set; }
        public string ClientId { get; set; }
        public string Secret { get; set; }
    }
}