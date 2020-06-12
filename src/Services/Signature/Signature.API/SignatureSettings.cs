namespace Signature.API
{
    public class SignatureSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string CollectionSignatures { get; set; }
        public string CollectionBrandings { get; set; }

        public string CollectionTest { get; set; }

        //public string CollectionMasters { get; set; }
        public string CollectionEvents { get; set; }

        public string LexonMySqlUrl { get; set; }
        public string LexonFilesUrl { get; set; }
        public string LexonApiGwUrl { get; set; }

        public string CentinelaApiGwUrl { get; set; }

        public string SignaturitApiUrl { get; set; }

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