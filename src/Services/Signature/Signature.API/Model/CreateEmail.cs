using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class CreateEmail
    {
        public List<Recipient> recipients { get; set; }
        public List<Recipient> cc { get; set; }
        public List<UserFile> files { get; set; }
        public string certificationType { get; set; }
        public List<CustomField> customFields { get; set; }
        public string subject { get; set; }
        public string body { get; set; }
        public string brandingId { get; set; }

    }
}
