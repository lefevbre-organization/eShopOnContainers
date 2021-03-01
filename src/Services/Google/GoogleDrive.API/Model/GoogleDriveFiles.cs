
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Model
{
    public class GoogleDriveFile    
    {

        public GoogleDriveFile()
        {
            files = new HashSet<GoogleDriveFile>();
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
        public IEnumerable<GoogleDriveFile> files { get; set; }

    }

    public class Root    {
        public string kind { get; set; } 
        public string nextPageToken { get; set; } 
        public bool incompleteSearch { get; set; } 
        public List<GoogleDriveFile> files { get; set; } 
    }

    public class DownloadedFile
    {
        public string mimeType { get; set; }
        public string content { get; set; }
    }

    public class GoogleDriveResonse
    {
        public string kind { get; set; }
        public string id { get; set; }
        public string name { get; set; }
        public string mimeType { get; set; }
        public string sessionId { get; set; }
        public string message { get; set; }
    }

    public class GoogleDriveBiggerFile
    {
        public string name { get; set; }
    }
 
}