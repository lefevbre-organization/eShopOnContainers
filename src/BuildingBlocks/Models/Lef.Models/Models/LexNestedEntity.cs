using System;
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
            name = entity.name;
            description = entity.description;
            email = entity.email;
        }

        public LexNestedEntity(FolderNestedView entity)
            :this()
        {
            idFolder = entity.idFolder;
            idRelated = entity.idFolder;
            idType = (short?)LexonAdjunctionType.folders;
            entityType = Enum.GetName(typeof(LexonAdjunctionType), (short?)LexonAdjunctionType.folders);
        }

        public List<LexNestedEntity> subChild { get; set; }

    }
}