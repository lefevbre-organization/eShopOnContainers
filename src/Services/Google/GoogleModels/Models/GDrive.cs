using System.Collections.Generic;

namespace GoogleModels.Models
{
    public class GDrive
    {
        public string kind { get; set; } 
        public bool incompleteSearch { get; set; } 
        public List<GDriveFile> files { get; set; } 
    }
}