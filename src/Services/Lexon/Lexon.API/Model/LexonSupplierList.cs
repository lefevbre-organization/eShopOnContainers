﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonSupplierList : MongoModel, ILexonList<LexonSupplier>
    {
        [BsonElement("timestamp")]
        public BsonTimestamp TimeStamp { get; set; }
        [BsonElement("list")]
        public LexonSupplier[] List { get; set; }
    }
}