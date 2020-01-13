﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonUser //: MongoModel
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string idUser { get; set; }
        public string token { get; set; }

        public string idNavision { get; set; }

        public string Name { get; set; }

        public short version { get; set; }

        public LexonCompaniesList companies { get; set; }
    }
}