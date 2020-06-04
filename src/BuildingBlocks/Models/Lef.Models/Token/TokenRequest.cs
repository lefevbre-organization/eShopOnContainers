using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequest
    {
        public string idClienteNavision { get; set; }
        public string idUser { get; set; }

        public List<string> roles { get; set; }
    }
}