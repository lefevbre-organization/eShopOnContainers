using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lexon.API.Model
{
    public class LexonMaster: MongoModel, ILexonList<LexonEntity>
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string type { get; set; }
        public short version { get; set; }
        public string name { get; set; }
        public long timeStamp { get; set; }
        public LexonEntity[] list { get; set; }
    }
}