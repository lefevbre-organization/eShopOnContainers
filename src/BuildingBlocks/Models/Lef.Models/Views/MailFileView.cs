namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class MailFileView : BaseView
    {
        public long idParent { get; set; }

        public string contentFile { get; set; }
        public string nameFile { get; set; }
    }
}