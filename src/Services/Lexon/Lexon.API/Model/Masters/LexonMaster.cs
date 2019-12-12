using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model
{
    [BsonIgnoreExtraElements]
    public class LexonMaster: MongoModel, ILexonList<LexonEntityType>
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string type { get; set; }
        public short version { get; set; }

        public long timeStamp { get; set; }
        public LexonEntityType[] list { get; set; }
    }
}