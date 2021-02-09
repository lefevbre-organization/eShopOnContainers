using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Model
{
    public class File    {
        public string kind { get; set; } 
        public string id { get; set; } 
        public string name { get; set; } 
        public string mimeType { get; set; } 
    }

    public class Root    {
        public string kind { get; set; } 
        public string nextPageToken { get; set; } 
        public bool incompleteSearch { get; set; } 
        public List<File> files { get; set; } 
    }
}