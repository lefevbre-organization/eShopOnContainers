using System.Collections.Generic;

namespace Lefebvre.Shared
{
    public class DriveCollection
    {
        public string kind { get; set; }
        public string incompleteSearch { get; set; }
        public List<DriveFile> files { get; set; }
    }
}