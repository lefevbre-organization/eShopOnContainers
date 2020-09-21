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

        [JsonProperty("user", NullValueHandling = NullValueHandling.Ignore)]
        public string User { get; set; }

        [JsonProperty("brandings", NullValueHandling = NullValueHandling.Ignore)]
        public List<UserBranding> Brandings { get; set; }

        [JsonProperty("certifiedEmails", NullValueHandling = NullValueHandling.Ignore)]
        public List<CertifiedEmail> CertifiedEmails { get; set; }
    }

    public partial class CertifiedEmail
    {
        [JsonProperty("guid", NullValueHandling = NullValueHandling.Ignore)]
        public string Guid { get; set; }

        [JsonProperty("externalId", NullValueHandling = NullValueHandling.Ignore)]
        public string ExternalId { get; set; }

        [JsonProperty("app", NullValueHandling = NullValueHandling.Ignore)]
        public string App { get; set; }

        [JsonProperty("created_at", NullValueHandling = NullValueHandling.Ignore)]
        public string CreatedAt { get; set; }

        [JsonProperty("type", NullValueHandling = NullValueHandling.Ignore)]
        public string CertificationType { get; set; }

        [JsonProperty("certificate", NullValueHandling = NullValueHandling.Ignore)]
        public List<Certificate> Certificates { get; set; }
    }

    public partial class Certificate
    {
        [JsonProperty("email", NullValueHandling = NullValueHandling.Ignore)]
        public string Email { get; set; }

        [JsonProperty("name", NullValueHandling = NullValueHandling.Ignore)]
        public string Name { get; set; }

        [JsonProperty("externalId", NullValueHandling = NullValueHandling.Ignore)]
        public string ExternalId { get; set; }

        [JsonProperty("document", NullValueHandling = NullValueHandling.Ignore)]
        public EmailDocument Document { get; set; }
    }

    public partial class EmailDocument
    {
        [JsonProperty("externalFileName", NullValueHandling = NullValueHandling.Ignore)]
        public string ExternalFileName { get; set; }

        [JsonProperty("internalInfo", NullValueHandling = NullValueHandling.Ignore)]
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
