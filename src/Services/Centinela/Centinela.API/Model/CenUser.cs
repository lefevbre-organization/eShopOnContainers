using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Centinela.API.Models
{
    //[BsonIgnoreExtraElements]
    public class CenUser //: MongoModel
    {
        /// <summary>
        /// id  del Usuario en formato Bsonid autogenerado por mongo
        /// </summary>
        //[BsonId]
        //[BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        public string idNavision { get; set; }

        public string name { get; set; }

        [JsonIgnore]
        public short version { get; set; }

        public CenEvaluation[] evaluations { get; set; }
    }
}