namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    using MongoDB.Bson.Serialization.Attributes;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using MongoDB.Bson;
    using System;
    using System.Collections.Generic;
    using System.Globalization;

    public partial class UserSignatures
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("user")]
        public string User { get; set; }

        [BsonElement("availableSignatures")]
        public int AvailableSignatures { get; set; }

        [BsonElement("brandings")]
        public List<UserBranding> Brandings { get; set; }

        [BsonElement("signatures")]
        public List<Signature> Signatures { get; set; }
    }

    
    public partial class Branding
    {
        [BsonElement("app")]
        public string App { get; set; }

        [BsonElement("externalId")]
        public string ExternalId { get; set; }
    }

    
    public partial class Signature
    {
        [BsonElement("externalId")]
        public string ExternalId { get; set; }

        [BsonElement("guid")]
        public string Guid { get; set; }

        [BsonElement("app")]
        public string App { get; set; }

        [BsonElement("documents")]
        public List<Document> Documents { get; set; }
    }

    public partial class Document
    {
        [BsonElement("externalFileName")]
        public string ExternalFileName { get; set; }

        [BsonElement("externalId")]
        public string ExternalId { get; set; }

        [BsonElement("internalInfo")]
        public InternalInfo InternalInfo { get; set; }

        [BsonElement("signer")]
        public Signer Signer { get; set; }
    }

    public partial class InternalInfo
    {
        [BsonElement("docId")]
        public string DocId { get; set; }

        [BsonElement("docName")]
        public string DocName { get; set; }
    }

    public partial class Signer
    {
        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }
    }

    //public partial class UserSignatures
    //{
    //    public static UserSignatures FromJson(string json) => JsonConvert.DeserializeObject<UserSignatures>(json, Signature.API.Model.Converter.Settings);
    //}

    //public static class Serialize
    //{
    //    public static string ToJson(this UserSignatures self) => JsonConvert.SerializeObject(self, Signature.API.Model.Converter.Settings);
    //}

    internal static class Converter
    {
        public static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            MetadataPropertyHandling = MetadataPropertyHandling.Ignore,
            DateParseHandling = DateParseHandling.None,
            Converters =
            {
                new IsoDateTimeConverter { DateTimeStyles = DateTimeStyles.AssumeUniversal }
            },
        };
    }

    internal class ParseStringConverter : JsonConverter
    {
        public override bool CanConvert(Type t) => t == typeof(long) || t == typeof(long?);

        public override object ReadJson(JsonReader reader, Type t, object existingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null) return null;
            var value = serializer.Deserialize<string>(reader);
            long l;
            if (Int64.TryParse(value, out l))
            {
                return l;
            }
            throw new Exception("Cannot unmarshal type long");
        }

        public override void WriteJson(JsonWriter writer, object untypedValue, JsonSerializer serializer)
        {
            if (untypedValue == null)
            {
                serializer.Serialize(writer, null);
                return;
            }
            var value = (long)untypedValue;
            serializer.Serialize(writer, value.ToString());
            return;
        }

        public static readonly ParseStringConverter Singleton = new ParseStringConverter();
    }
}
