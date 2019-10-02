﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonLawyersList : MongoModel, ILexonList<LexonLawyer>
    {
        [BsonElement("timestamp")]
        public long TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonLawyer[] List { get; set; }
    }
}