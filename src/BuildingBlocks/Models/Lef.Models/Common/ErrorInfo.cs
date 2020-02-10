namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class ErrorInfo: Info
    {
        public string source { get; set; }
        public string detail { get; set; }
        public string member { get; internal set; }
        public int line { get; internal set; }

    }




}