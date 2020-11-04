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
    public class EmailEventInfo
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string mongoId { get; set; }

        [JsonProperty("certificate")]
        [BsonElement("Certificate")]
        public EventCertificate Certificate { get; set; }

        [JsonProperty("created_at")]
        [BsonElement("CreatedAt")]
        public string CreatedAt { get; set; }

        [JsonProperty("type")]
        [BsonElement("Type")]
        public string Type { get; set; }


    }
}