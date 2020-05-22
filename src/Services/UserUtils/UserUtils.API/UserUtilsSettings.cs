using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API
{
    public class UserUtilsSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionByPass { get; set; }
        public short Version { get; set; }
        public string CollectionEvents { get; set; }

        public string MinihubUrl { get; set; }
        public string OnlineUrl { get; set; }
        public string LoginUrl { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }
        public long IdAppNavision { get; set; }
        public long TokenCaducity { get; set; }

        public string TokenKey { get; set; }
        public string OnlineLogin { get; set; }
        public string OnlinePassword { get; set; }

        public ByPassModel[] ByPassUrls { get; set; }
    }
}