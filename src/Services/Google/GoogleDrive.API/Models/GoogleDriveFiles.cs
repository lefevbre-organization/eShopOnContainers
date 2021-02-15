using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Models
{
    public class File    
    {

        public File()
        {
            files = new HashSet<File>();
        }

        public string kind { get; set; } 
        public string id { get; set; } 
        public string name { get; set; } 
        public string mimeType { get; set; } 
        public bool starred { get; set; } 
        public bool trashed { get; set; } 
        public List<string> parents { get; set; } 
        public string webViewLink { get; set; } 
        public string iconLink { get; set; } 
        public bool hasThumbnail { get; set; } 
        public IEnumerable<File> files { get; set; }

    }

    public class Root    {
        public string kind { get; set; } 
        public string nextPageToken { get; set; } 
        public bool incompleteSearch { get; set; } 
        public List<File> files { get; set; } 
    }
}