namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class EntitySearchView : EntityView
    {
        /// <summary>id to filter (use in documents and folders entities</summary>
        public long? idFilter { get; set; }

        /// <summary> string with search filter </summary>
        public string search { get; set; }

        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }
    }
}