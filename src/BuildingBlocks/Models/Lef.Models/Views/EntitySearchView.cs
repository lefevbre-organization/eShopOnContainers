namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class EntitySearchView : EntityView
    {

        /// <summary> string with search filter </summary>
        public string search { get; set; }

        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }
    }
}