namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class FolderToEntity: EntitySearchById
    {
        /// <summary>
        /// Nombre de la carpeta, si no se envia, usara el nombre de la entidad en base a su id
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Carpeta de la que colgará la carpeta creada si se precisa
        /// </summary>
        public int? IdParent { get; set; }
    }
}