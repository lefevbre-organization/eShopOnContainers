namespace Lexon.API
{
    public class LexonSettings
    {
        public string ConnectionString { get;
            set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionMasters { get; set; }
        public string CollectionEvents { get; set; }
        public string PicBaseUrl { get; set; }

        public string LexonMySqlUrl { get; set; }

        public string EventBusConnection { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }

        public EventBusSettings EventBus { get; set; }
    }
}