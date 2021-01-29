
using Google.Credentials.Enumerators;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model
{
    public class UserCredentialResponse
    {
        public GoogleProduct Product { get; set; }
        public string GoogleMailAccount { get; set; }
        public string ClientId { get; set; }
        public string Secret { get; set; }
    }
}