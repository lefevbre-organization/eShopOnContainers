using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequest
    {
        public int? idApp { get; set; }
        public string idClienteNavision { get; set; }

        public int? idClienteLef { get; set; }

        public string name { get; set; }
        public string idUserApp { get; set; }
        public List<string> roles { get; set; }
        public string env { get; set; }
    }


}