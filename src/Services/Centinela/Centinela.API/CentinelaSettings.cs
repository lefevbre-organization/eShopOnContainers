namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API
{
    public class CentinelaSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionEvents { get; set; }
        public short Version { get; set; }

        public string CentinelaUrl { get; set; }
        public string CentinelaLogin { get; set; }
        public string CentinelaPassword { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }
        public long IdAppNavision { get; set; }
    }
}