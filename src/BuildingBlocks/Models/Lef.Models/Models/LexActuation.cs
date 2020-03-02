using MongoDB.Bson.Serialization.Attributes;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class LexActuation
    {
        [BsonIgnore]
        public string Asunto { get; set; }
        public string description { get; set; }

        [BsonIgnore]
        public string Nombre { get; set; }
        public string name { get; set; }

        public int Actuacion { get; set; }

        [BsonIgnore]
        public int IdRelacion { get; set; }
        public long idRelated { get; set; }


        [BsonIgnore]
        public short TipoRelacion { get; set; }
        public short entityIdType { get; set; }


        [BsonIgnore]
        public string TipoEntidad { get; set; }
        public string entityType { get; set; }


        public string idMail { get; set; }

        //public long id { get; set; }



        [BsonIgnore]
        public string Fecha { get; set; }

        public string date { get; set; }
    }
}