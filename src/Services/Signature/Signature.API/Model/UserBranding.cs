using MongoDB.Bson.Serialization.Attributes;

namespace Signature.API.Model
{
    public class UserBranding
    {
        public string app { get; set; }
        public string externalId { get; set; }
    }
}
