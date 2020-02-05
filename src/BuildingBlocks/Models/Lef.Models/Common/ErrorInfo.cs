namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class ErrorInfo
    {
        public string source { get; set; }
        public string message { get; set; }
        public string detail { get; set; }
        public string member { get; internal set; }
        public int line { get; internal set; }
        public int code { get; internal set; }
    }
}