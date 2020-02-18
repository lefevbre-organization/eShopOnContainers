namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class ClassificationSearchView:  ClassificationRemoveView
    {
        public int pageSize { get; set; }
        public int pageIndex { get; set; }

    }
}