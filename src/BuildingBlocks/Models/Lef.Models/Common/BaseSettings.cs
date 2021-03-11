namespace Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models
{
    public class BaseSettings
    {
        #region Mongo
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionEvents { get; set; }
        #endregion

        #region EventBus
        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }
        #endregion

        public bool UseCustomizationData { get; set; }
        public bool AzureStorageEnabled { get; set; }
        public short Version { get; set; }

        public long IdAppNavision { get; set; }


    }

}