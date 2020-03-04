namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class LexMailActuation
    {
        /// <summary>
        /// identificador universal del mail
        /// </summary>
        public string uid { get; set; }

        /// <summary>
        /// cuenta de correo
        /// </summary>
        public string mailAccount { get; set; }

        /// <summary>
        /// provvedor de la cuenta: IMAP, GO, OU
        /// </summary>
        public string provider { get; set; }

        /// <summary>
        /// campo opcional que indica el folder
        /// </summary>
        public string folder { get; set; }

        /// <summary>
        /// lista de actuaciones
        /// </summary>
        public LexActuation[] actuaciones { get; set; }
    }
}