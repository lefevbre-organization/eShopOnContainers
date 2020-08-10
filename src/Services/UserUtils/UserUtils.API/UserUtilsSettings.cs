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
        public string ClavesUrl { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }
        public short IdAppUserUtils { get; set; }
        public short IdAppLexon { get; set; }
        public short IdAppCentinela { get; set; }
        public short IdAppSignaturit { get; set; }
        public long TokenCaducity { get; set; }

        public string TokenKey { get; set; }
        public string OnlineLogin { get; set; }
        public string OnlinePassword { get; set; }

        public string CentinelaApiUrl { get; set; }
        public string LexonApiUrl { get; set; }
        public string SignaturitApiUrl { get; set; }

        public ByPassModel[] ByPassUrls { get; set; }
    }
}