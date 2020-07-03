namespace Lexon.API
{
    public class LexonSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionMasters { get; set; }
        public string CollectionEvents { get; set; }

        public string LexonMySqlUrl { get; set; }
        public string LexonFilesUrl { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }
        public long IdAppNavision { get; set; }

        public EnvironmentModel[] LexonUrls { get; set; }
        public string DefaultEnvironmet { get; set; }

        public StoreProcedures SP { get; set; }

    }

    public class StoreProcedures
    {
        public string GetUserDetails { get; set; }
        public string GetCompanies { get; set; }
        public string GetMasterEntities { get; set; }
        public string SearchEntities { get; set; }
        public string SearchFoldersFiles { get; set; }
        public string SearchRelations { get; set; }
        public string AddRelation { get; set; }
        public string AddEntityFolder { get; set; }
        public string RemoveRelation { get; set; }
        public string AddContactRelations { get; set; }
        public string GetEntity { get; set; }
        public string GetContact { get; set; }

    }

    public class EnvironmentModel
    {
        public string env { get; set; }
        public string bbdd { get; set; }
        public string conn { get; set; }
        public string url { get; set; }
    }
}