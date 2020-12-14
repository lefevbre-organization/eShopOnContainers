namespace Signature.API.Model
{
    using System;
    using System.Collections.Generic;

    using System.Globalization;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    public partial class UserCertDocuments
    {
        [JsonProperty("user")]
        public string User { get; set; }

        [JsonProperty("documents")]
        public List<CertDocument> Documents { get; set; }
    }
    public partial class CertDocument
    {
        [JsonProperty("guid")]
        public string Guid { get; set; }

        [JsonProperty("externalId")]
        public string ExternalId { get; set; }

        [JsonProperty("crc")]
        public string Crc { get; set; }

        [JsonProperty("created_at")]
        public string CreatedAt { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("size")]
        public long Size { get; set; }

        [JsonProperty("app")]
        public string App { get; set; }
    }
}
