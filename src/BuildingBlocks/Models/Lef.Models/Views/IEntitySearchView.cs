namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public interface IEntitySearchView
    {
        int pageIndex { get; set; }
        int pageSize { get; set; }
        string search { get; set; }
    }
}