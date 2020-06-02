

using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Signature.API.Model
{
    public class MongoEventInfo
    {
        [BsonElement("user")]
        public string User { get; set; }


        public List<Signature> signature { get; set; }

    }
}
