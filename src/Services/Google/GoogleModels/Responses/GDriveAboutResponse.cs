namespace GoogleModels.Models
{
    public class GDriveAboutResponse
    {
        public GDriverUser user { get; set; }
        public GDriveStorageQuota storageQuota { get; set; }
        public long maxUploadSize { get; set; }
    }
}