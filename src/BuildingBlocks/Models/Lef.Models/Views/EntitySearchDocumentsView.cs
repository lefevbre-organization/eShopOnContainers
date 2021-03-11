﻿namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class EntitySearchDocumentsView: EntitySearchView, IEntitySearchView
    {
        /// <summary>
        /// en caso de documentos, sirve para buscar por la carpeta donde se encuentres,
        /// en caso de carpetas, si existe nos busca por ese folder en particular
        /// </summary>
        public long? idFolder { get; set; }
    }
}