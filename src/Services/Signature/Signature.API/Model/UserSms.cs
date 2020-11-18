namespace Signature.API.Model
{
    using System;
    using System.Collections.Generic;

    using System.Globalization;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    public partial class UserSms
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("certifiedSms")]
        public List<CertifiedSms> CertifiedSms { get; set; }
    }

    public partial class CertifiedSms
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
        public List<SmsCertificate> Certificates { get; set; }
    }

    public partial class SmsCertificate
    {
        [BsonElement("phone")]
        public string Phone { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("externalId")]
        public string ExternalId { get; set; }

        [BsonElement("document")]
        public SmsDocument Document { get; set; }
    }

    public partial class SmsDocument
    {
        [BsonElement("externalFileName")]
        public string ExternalFileName { get; set; }

        [BsonElement("internalInfo")]
        public InternalInfo InternalInfo { get; set; }
    }

    //public partial class InternalInfo
    //{
    //    [BsonElement("docId")]
    //    public string DocId { get; set; }

    //    [BsonElement("docName")]
    //    public string DocName { get; set; }
    //}

    public partial class UserSms
    {
        public static UserSms FromJson(string json) => JsonConvert.DeserializeObject<UserSms>(json);
    }

    public static class SerializeSms
    {
        public static string ToJson(this UserSms self) => JsonConvert.SerializeObject(self);
    }
}
