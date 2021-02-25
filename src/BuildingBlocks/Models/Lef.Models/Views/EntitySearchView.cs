﻿namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class EntitySearchView : EntityView, IEntitySearchView
    {

        /// <summary> string with search filter </summary>
        public string search { get; set; }

        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }
    }
}