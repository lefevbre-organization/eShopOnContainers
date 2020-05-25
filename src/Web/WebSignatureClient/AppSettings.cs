using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Clients.WebSignature
{
    public class AppSettings
    {
        public string IdentityUrl { get; set; }
        public string SignatureApiUrlHC { get; set; }
        public bool UseCustomizationData { get; set; }
    }
}
