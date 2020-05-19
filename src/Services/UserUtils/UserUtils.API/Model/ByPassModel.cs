using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    public class ByPassModel
    {
        /// <summary>
        /// id en formato Bsonid autogenerado por mongo
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        public long Created { get; set; }
        public string NameService { get; set; }
        public string UrlByPass { get; set; }

    }
}