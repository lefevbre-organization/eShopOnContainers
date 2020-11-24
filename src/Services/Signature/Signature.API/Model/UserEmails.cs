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

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("brandings")]
        public List<UserBranding> Brandings { get; set; }

        [BsonElement("certifiedEmails")]
        public List<CertifiedEmail> CertifiedEmails { get; set; }
    }

    public partial class CertifiedEmail
    {
        [JsonProperty("guid")]
        [BsonElement("guid")]
        public string Guid { get; set; }

        [JsonProperty("externalId")]
        [BsonElement("externalId")]
        public string ExternalId { get; set; }

        [JsonProperty("app")]
        [BsonElement("app")]
        public string App { get; set; }

        [JsonProperty("created_at")]
        [BsonElement("created_at")]
        public string CreatedAt { get; set; }

        [JsonProperty("type")]
        [BsonElement("type")]
        public string CertificationType { get; set; }

        [JsonProperty("certificate")]
        [BsonElement("certificate")]
        public List<Certificate> Certificates { get; set; }
    }

    public partial class Certificate
    {
        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("externalId")]
        public string ExternalId { get; set; }

        [BsonElement("document")]
        public EmailDocument Document { get; set; }
    }

    public partial class EmailDocument
    {
        [BsonElement("externalFileName")]
        public string ExternalFileName { get; set; }

        [BsonElement("internalInfo")]
        public InternalInfo2 InternalInfo { get; set; }
    }

    public partial class InternalInfo2
    {
        [BsonElement("docId")]
        public string DocId { get; set; }

        [BsonElement("docName")]
        public string DocName { get; set; }
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
