using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Signature.API.Model
{
    public class SignEventInfo
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string mongoId { get; set; }

        [JsonProperty("created_at")]
        [BsonElement("CreatedAt")]
        public string CreatedAt { get; set; }
        
        [JsonProperty("file")]
        [BsonElement("File")]
        public FileInfo File { get; set; }
        
        [JsonProperty("id")]
        [BsonElement("DocumentId")]
        public string DocumentId { get; set; }

        [JsonProperty("events")]
        [BsonElement("Events")]
        public List<SingleEvent> Events { get; set; }

        [JsonProperty("signature")]
        [BsonElement("Signature")]
        public EventSignature Signature { get; set; }

        [JsonProperty("email")]
        [BsonElement("Email")]
        public string Email { get; set; }

        [JsonProperty("name")]
        [BsonElement("Name")]
        public string Name { get; set; }

        [JsonProperty("status")]
        [BsonElement("Status")]
        public string Status { get; set; }

        //[JsonProperty("created_at")]
        //public string CreatedAt2 { get; set; }

        [JsonProperty("type")]
        [BsonElement("Type")]
        public string Type { get; set; }
    }
}
