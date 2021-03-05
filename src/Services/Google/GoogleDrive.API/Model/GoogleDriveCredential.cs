using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Model
{
    
    public class User    
    {
        public string kind { get; set; } 
        public string displayName { get; set; } 
        public string photoLink { get; set; } 
        public bool me { get; set; } 
        public string permissionId { get; set; } 
        public string emailAddress { get; set; } 
    }

    public class StorageQuota    
    {
        public string limit { get; set; } 
        public string usage { get; set; } 
        public string usageInDrive { get; set; } 
        public string usageInDriveTrash { get; set; } 
    }

    public class DriveCredential    
    {
        public string kind { get; set; } 
        public User user { get; set; } 
        public StorageQuota storageQuota { get; set; }
        public GoogleDriveErrorResponse error { get; set; }
    }

    public class GoogleDriveErrorResponse
    {
        public GoogleDriveError error { get; set; }
    }

    public class GoogleDriveError
    {
        public int code { get; set; }
        public string message { get; set; }
        public List<GoogleDriveErrorItem> errors { get; set; }
    }

    public class GoogleDriveErrorItem
    {
        public string domain { get; set; }
        public string reason { get; set; }
        public string message { get; set; }
        public string locationType { get; set; }
        public string location { get; set; }
    }

}