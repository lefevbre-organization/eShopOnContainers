using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    [BsonIgnoreExtraElements]
    public class LexUser : MongoModel
    {
        /// <summary>
        /// id  del Usuario en formato Bsonid autogenerado por mongo
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        [BsonIgnore]
        public string token { get; set; }

        public string idUser { get; set; }

        public string idNavision { get; set; }

        public string name { get; set; }

        [JsonIgnore]
        public short version { get; set; }

        public LexCompany[] companies { get; set; }
    }
}