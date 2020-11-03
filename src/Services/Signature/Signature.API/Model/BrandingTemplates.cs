using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class BrandingTemplates
    {
        public string signatures_request { get; set; }
        public string signatures_receipt { get; set; }
        public string pending_sign { get; set; }
        public string document_canceled { get; set; }
        public string request_expired { get; set; }
        public string emails_request { get; set; }
    }
}
