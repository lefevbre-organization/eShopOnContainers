﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonActuationList : MongoModel, ILexonList<LexonActuation>
    {

        public BsonTimestamp TimeStamp { get; set; }

        public LexonActuation[] List { get; set; }

    }
}