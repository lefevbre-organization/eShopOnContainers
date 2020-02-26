namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class EntitySearchFoldersView: EntitySearchDocumentsView
    {
        /// <summary>
        /// Nos permite buscar las carpetas que cuelgan de una carpeta padre
        /// </summary>
        public long? idParent { get; set; }
    }
}