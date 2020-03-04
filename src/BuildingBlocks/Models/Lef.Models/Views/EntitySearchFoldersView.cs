namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class EntitySearchFoldersView: EntitySearchDocumentsView, IEntitySearchView
    {
        public EntitySearchFoldersView()
        {
            this.idType = (short?)LexonAdjunctionType.folders;
        }
        public EntitySearchFoldersView(string bbdd, string idUser):this()
        {
            this.bbdd = bbdd;
            this.idUser = idUser;
        }

        /// <summary>
        /// Nos permite buscar las carpetas que cuelgan de una carpeta padre
        /// </summary>
        public long? idParent { get; set; }
    }
}