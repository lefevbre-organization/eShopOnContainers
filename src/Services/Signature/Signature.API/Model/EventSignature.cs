using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class EventSignature
    {
        [JsonProperty("id")]
        [BsonElement("_id")]
        public string Id { get; set; }
    }
}
