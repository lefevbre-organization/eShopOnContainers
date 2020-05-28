using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class DocumentInfo
    {
        public string email { get; set; }
        public List<SingleEvent> events { get; set; }
        public FileInfo file { get; set; }
        public string id { get; set; }
        public string name { get; set; }
        public string status { get; set; }
    }
}
