using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class TokenRequestCentinelaNewFirm : TokenRequestCentinelaViewFirm
    {
        public List<string> MailsAdmins { get; set; }

        public List<string> DocumentsId { get; set; }
        public List<string> RecipientsId { get; set; }

        public string LogoUrl { get; set; }


    }


}