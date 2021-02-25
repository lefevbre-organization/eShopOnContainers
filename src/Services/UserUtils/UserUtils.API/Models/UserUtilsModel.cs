using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    [BsonIgnoreExtraElements]
    public class UserUtilsModel : MongoModel
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        public string idNavision { get; set; }

        public string name { get; set; }

        public TokenControl[] tokens { get; set; }
        public LefebvreApp[] apps { get; set; }

        [JsonIgnore]
        public short version { get; set; }
    }
}