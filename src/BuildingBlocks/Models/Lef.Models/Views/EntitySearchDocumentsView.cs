namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class EntitySearchDocumentsView: EntitySearchView
    {
        /// <summary>
        /// en caso de documentos, sirve para buscar por la carpeta donde se encuentres,
        /// en caso de carpetas, si existe nos busca por ese folder en particular
        /// </summary>
        public long? idFolder { get; set; }
    }
}