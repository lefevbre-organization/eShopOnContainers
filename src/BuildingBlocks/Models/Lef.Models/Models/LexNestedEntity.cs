using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
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