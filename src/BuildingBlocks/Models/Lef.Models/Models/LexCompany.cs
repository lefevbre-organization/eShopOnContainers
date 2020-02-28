using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    [BsonIgnoreExtraElements]
    public class LexCompany : MongoModel
    {
        //id de la compañia
        public long idCompany { get; set; }

        /// <summary>
        /// nombre de la compañia
        /// </summary>
        public string name { get; set; }

        /// <summary>
        /// cadena de conexión de la bd de la compañia
        /// </summary>
        public string bbdd { get; set; }

        [JsonIgnore]
        public long updated { get; set; }
        /// <summary>
        /// Coleccion de entidades de la compañia
        /// </summary>
        public LexEntity[] entities { get; set; }

        /// <summary>
        /// Coleccion de mails con los que esta relacionado (adjunción)
        /// </summary>
        public LexActuation[] actuations { get; set; }
    }
}