using System;
using System.Collections.Generic;

namespace GoogleModels.Models
{
    public class GDriveFile
    {
        public string kind { get; set; } 
        public string id { get; set; } 
        public string name { get; set; } 
        public string mimeType { get; set; } 
        public bool starred { get; set; } 
        public bool trashed { get; set; } 
        public bool explicitlyTrashed { get; set; } 
        public List<string> spaces { get; set; } 
        public string version { get; set; } 
        public string webViewLink { get; set; } 
        public string iconLink { get; set; } 
        public bool hasThumbnail { get; set; } 
        public string thumbnailLink { get; set; } 
        public DateTime createdTime { get; set; } 
        public DateTime modifiedTime { get; set; } 
        public List<string> parents { get; set; } 
        public List<GDriveFile> files { get; set; }
    }
}