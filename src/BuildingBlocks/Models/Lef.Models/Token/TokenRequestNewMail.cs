using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class TokenRequestNewMail: TokenRequestDataBase
    {
        public short? idEntityType { get; set; }

        public int? idEntity { get; set; }

        public List<string> mailContacts { get; set; }

    }

}