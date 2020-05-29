using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class FileInfo
    {
       [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("pages")]
        public long Pages { get; set; }

        [JsonProperty("size")]
        public long Size { get; set; }
    }
}
