﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonFilesList : MongoModel, ILexonList<LexonFile>
    {
        [BsonElement("timestamp")]
        public BsonTimestamp TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonFile[] List { get; set; }
    }
}