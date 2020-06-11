using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequest
    {
        public int? IdApp { get; set; }
        public string IdClienteNavision { get; set; }
        public string Name { get; set; }
        public string IdUser { get; set; }
        //TODO: meter idApp
        public List<string> Roles { get; set; }
    }


}