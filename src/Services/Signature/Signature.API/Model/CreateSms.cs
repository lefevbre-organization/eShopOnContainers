using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Model
{
    public class CreateSms
    {
        public List<SmsRecipient> recipients { get; set; }
        public List<UserFile> files { get; set; }
        public string certificationType { get; set; }
        public List<CustomField> customFields { get; set; }
        public string body { get; set; }
    }
}
