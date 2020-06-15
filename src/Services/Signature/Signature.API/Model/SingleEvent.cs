﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class SingleEvent
    {
        [JsonProperty("created_at")]
        public string CreatedAt { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }
    }
}