using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenModelLexon : TokenModelBase
    {
        /// <summary>
        /// Id del usuario en la aplicación donde este logado
        /// </summary>
        public long? idUserApp { get; set; }

        public string bbdd { get; set; }

        public string idMail { get; set; }
        public string provider { get; set; }
        public string mailAccount { get; set; }
        public string folder { get; set; }


        public short? idEntityType { get; set; }

        public int? idEntity { get; set; }

        public List<string> mailContacts { get; set; }
    }
}