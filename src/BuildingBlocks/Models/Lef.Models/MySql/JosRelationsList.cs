namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class JosRelationsList
    {
        public string Uid { get; set; }
        public string Provider { get; set; }
        public string MailAccount { get; set; }

        public JosActuation[] Actuaciones { get; set; }

    }
}