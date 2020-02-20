namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class ClassificationRemoveView : ClassificationView
    {
        /// <summary> string with the uid of the mail to search or remove</summary>
        public string idMail { get; set; }
        public string Provider { get; set; }
        public string MailAccount { get; set; }
        public string Folder { get; set; }


    }
}