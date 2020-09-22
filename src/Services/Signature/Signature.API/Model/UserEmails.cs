namespace Signature.API.Model
{
    using System;
    using System.Collections.Generic;

    using System.Globalization;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    public partial class UserEmails
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [JsonProperty("user")]
        public string User { get; set; }

        [JsonProperty("brandings")]
        public List<UserBranding> Brandings { get; set; }

        [JsonProperty("certifiedEmails")]
        public List<CertifiedEmail> CertifiedEmails { get; set; }
    }

    public partial class CertifiedEmail
    {
        [JsonProperty("guid")]
        public string Guid { get; set; }

        [JsonProperty("externalId")]
        public string ExternalId { get; set; }

        [JsonProperty("app")]
        public string App { get; set; }

        [JsonProperty("created_at")]
        public string CreatedAt { get; set; }

        [JsonProperty("type")]
        public string CertificationType { get; set; }

        [JsonProperty("certificate")]
        public List<Certificate> Certificates { get; set; }
    }

    public partial class Certificate
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("externalId")]
        public string ExternalId { get; set; }

        [JsonProperty("document")]
        public EmailDocument Document { get; set; }
    }

    public partial class EmailDocument
    {
        [JsonProperty("externalFileName")]
        public string ExternalFileName { get; set; }

        [JsonProperty("internalInfo")]
        public InternalInfo InternalInfo { get; set; }
    }

    public partial class UserEmails
    {
        public static UserEmails FromJson(string json) => JsonConvert.DeserializeObject<UserEmails>(json);
    }

    public static class Serialize
    {
        public static string ToJson(this UserEmails self) => JsonConvert.SerializeObject(self);
    }
}
