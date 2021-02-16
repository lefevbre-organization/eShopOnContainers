using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Model
{
    public class CreateDocCertification
    {
        public string user { get; set; }
        public string guid { get; set; }
        public string app { get; set; }
        public List<UserFile> files { get; set; }
    }
}
