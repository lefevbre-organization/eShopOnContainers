using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class Recipient
    {
        public string name { get; set; }
        public string email { get; set; }
        public string role { get; set; } = "";
        public string signatureType { get; set; } = "";
        public string doubleAuthType { get; set; } = "";
        public string doubleAuthInfo { get; set; } = "";
    }
}
