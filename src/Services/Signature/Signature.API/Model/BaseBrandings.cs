﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class BaseBrandings
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string app { get; set; }
        public string type { get; set; }

        public string created_at { get; set; }

        public string id_signaturit { get; set; }

        public BrandingConfiguration configuration { get; set; }
    }
}
