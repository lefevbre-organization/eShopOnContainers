using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class UserFile
    {
        public byte[] file { get; set; }
        public string fileName { get; set; }
    }
}
