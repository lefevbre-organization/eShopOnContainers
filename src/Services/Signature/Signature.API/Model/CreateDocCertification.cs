using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class CreateDocCertification
    {
        public string user { get; set; }
        public string guid { get; set; }
        public string app { get; set; }
        public List<UserFile> files { get; set; }
    }
}
