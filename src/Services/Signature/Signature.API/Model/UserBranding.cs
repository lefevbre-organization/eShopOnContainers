using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class UserBranding
    {
        public string app { get; set; }
        public string externalId { get; set; }
    }
}
