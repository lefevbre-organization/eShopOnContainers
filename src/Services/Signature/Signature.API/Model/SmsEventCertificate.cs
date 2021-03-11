using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class SmsEventCertificate
    {
        [JsonProperty("created_at")]
        [BsonElement("CreatedAt")]
        public string CreatedAt { get; set; }

        [JsonProperty("file")]
        [BsonElement("File")]
        public FileInfo File { get; set; }

        [JsonProperty("id")]
        [BsonElement("CertificateId")]
        public string CertificateId { get; set; }

        [JsonProperty("events")]
        [BsonElement("Events")]
        public List<SingleEvent> Events { get; set; }

        [JsonProperty("phone")]
        [BsonElement("Phone")]
        public string Phone { get; set; }

        [JsonProperty("name")]
        [BsonElement("Name")]
        public string Name { get; set; }

        [JsonProperty("status")]
        [BsonElement("Status")]
        public string Status { get; set; }
    }
}
