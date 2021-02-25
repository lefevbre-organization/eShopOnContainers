using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class TokenRequestCentinelaNewFirm : TokenRequestCentinelaViewFirm
    {
        public List<string> mailsAdmins { get; set; }

        public List<string> documentsId { get; set; }
        public List<string> recipientsId { get; set; }

        public string logoUrl { get; set; }

        public string service { get; set; }


    }


}