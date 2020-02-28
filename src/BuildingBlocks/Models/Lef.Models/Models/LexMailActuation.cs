using MongoDB.Bson.Serialization.Attributes;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class LexMailActuation
    {
        /// <summary>
        /// identificador universal del mail
        /// </summary>
        public string uid { get; set; }

        /// <summary>
        /// cuenta de correo
        /// </summary>
        public string mailAccount { get; set; }

        /// <summary>
        /// provvedor de la cuenta: IMAP, GO, OU
        /// </summary>
        public string provider { get; set; }

        /// <summary>
        /// campo opcional que indica el folder
        /// </summary>
        public string folder { get; set; }

        /// <summary>
        /// lista de actuaciones
        /// </summary>
        public LexActuation[] actuaciones { get; set; }
    }

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