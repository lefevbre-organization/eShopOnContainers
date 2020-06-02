using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class DocumentInfo
    {
        [JsonProperty("email")]
        public string Email { get; set; }
        [JsonProperty("events")] 
        public List<SingleEvent> Events { get; set; }
        [JsonProperty("file")] 
        public FileInfo File { get; set; }
        [JsonProperty("id")] 
        public string Id { get; set; }
        [JsonProperty("name")] 
        public string Name { get; set; }
        [JsonProperty("status")] 
        public string Status { get; set; }
    }
}
