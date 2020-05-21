using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models
{
    [BsonIgnoreExtraElements]
    public class UserUtilsUser : MongoModel
    {
        /// <summary>
        /// id  del Usuario en formato Bsonid autogenerado por mongo
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        public string idNavision { get; set; }

        public string name { get; set; }

        public TokenControl[] tokens { get; set; }
        public LefebvreApp[] apps { get; set; }

        [JsonIgnore]
        public short version { get; set; }

        
    }

    public class LefebvreApp
    {
        public short indAcceso { get; set; }
        public string icono { get; set; }
        public int idHerramienta { get; set; }
        public string descHerramienta { get; set; }
        public string url { get; set; }

        public string urlByPass {get; set;}
        //"indAcceso":1,"icono":"lf-icon-qmemento","idHerramienta":1,"descHerramienta":"Bases de datos","url":"https://herculesppd.lefebvre.es/webclient46/login.do?ei=f3NrcnZs"
    }
}