using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    [BsonIgnoreExtraElements]
    public class LexEntity : MongoModel
    {
        /// <summary>
        /// id del tipo de entidad, establecerá la configuración delr esto de los campos
        /// </summary>
        public short? idType { get; set; }

        /// <summary>
        /// Nombre del tipo de entidad
        /// </summary>
        public string entityType { get; set; }

        /// <summary>
        /// id de la entidad en su tabla de la BD
        /// </summary>
        public long idRelated { get; set; }

        /// <summary>
        /// su idFolder correspondiente
        /// </summary>
        public long? idFolder { get; set; }

        /// <summary>
        /// el codigo o nombre que identifica a la entidad
        /// </summary>
        public string code { get; set; }

        //public string name { get; set; }

        /// <summary>
        /// campo que trae información complementaria, nombres alternativos u otros
        /// </summary>
        public string description { get; set; }

        /// <summary>
        /// Si hubiera un entidad de tipo contacto asociada a la entidad, nos trae su nombre
        /// </summary>
        public string intervening { get; set; }

        /// <summary>
        /// Si hubiera una entidad de tipo contacto asociada a la entidad, nos trae su mail
        /// </summary>
        public string email { get; set; }


    }

    /// <summary>
    /// Se utiliza para recuperar estructuras de directorios y archivos anidados
    /// </summary>
    public class LexNestedEntity: LexEntity
    {
        public LexNestedEntity()
        {
            subChild = new List<LexNestedEntity>();
        }

        public LexNestedEntity(LexEntity entity)
            :this()
        {
            idFolder = entity.idFolder;
            idRelated = entity.idRelated;
            idType = entity.idType;
            intervening = entity.intervening;
            entityType = entity.entityType;
            code = entity.code;
            description = entity.description;
            email = entity.email;
        }

        public List<LexNestedEntity> subChild { get; set; }

    }
}