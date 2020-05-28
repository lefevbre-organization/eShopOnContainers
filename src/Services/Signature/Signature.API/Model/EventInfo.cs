using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class EventInfo
    {
        public string created_at { get; set; }
        public DocumentInfo document { get; set; }
        public string type { get; set; }
    }
}
