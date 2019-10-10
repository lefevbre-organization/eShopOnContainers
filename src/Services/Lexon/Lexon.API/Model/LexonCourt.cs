﻿using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonCourt : MongoModel, IEntity
    {
        public long idCourt { get; set; }

        public string name { get; set; }
        public string description { get; set; }
    }
}