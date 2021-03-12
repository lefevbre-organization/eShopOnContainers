namespace GoogleModels.Models
{
    public class GDriveStorageQuota
    {
        public long limit { get; set; } 
        public long usage { get; set; } 
        public long usageInDrive { get; set; } 
        public long usageInDriveTrash { get; set; } 
    }
}