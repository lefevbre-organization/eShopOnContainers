using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    public class TokenControl
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public long Created { get; set; }
        public string Token { get; set; }
        public string NameService { get; set; }

    }
}