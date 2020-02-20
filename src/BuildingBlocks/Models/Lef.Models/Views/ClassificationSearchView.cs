namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    /// <summary>
    /// User to search classifications of mails
    /// </summary>
    public class ClassificationSearchView:  ClassificationRemoveView
    {

        /// <summary>quantity of records to return , by default 20,  all = 0</summary>
        public int pageSize { get; set; }

        /// <summary>use to paginate results, by default 1</summary>
        public int pageIndex { get; set; }
    }

}
