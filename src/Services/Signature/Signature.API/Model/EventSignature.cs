using Newtonsoft.Json;

namespace Signature.API.Model
{
    public class EventSignature
    {
        [JsonProperty("id")]
        public string Id { get; set; }
    }
}
