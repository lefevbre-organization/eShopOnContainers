﻿namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class FolderNestedView: BaseView
    {
        public long idFolder { get; set; }

        public short nestedLimit { get; set; }

        public bool includeFiles { get; set; }

        public string search { get; set; }
    }
}