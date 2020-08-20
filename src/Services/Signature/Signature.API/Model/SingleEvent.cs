using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class SingleEvent
    {
        [JsonProperty("created_at")]
        [BsonElement("CreatedAt")]
        public string CreatedAt { get; set; }

        [JsonProperty("type")]
        [BsonElement("Type")]
        public string Type { get; set; }
    }
}
