using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    public class ByPassModel
    {
        [BsonId]
        [BsonIgnoreIfDefault]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        public long? Created { get; set; }
        public string NameService { get; set; }
        public string UrlByPass { get; set; }
        public string Url { get; set; }

    }
}