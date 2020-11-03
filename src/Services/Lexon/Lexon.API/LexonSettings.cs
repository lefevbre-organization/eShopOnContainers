using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.API
{
    public class LexonSettings : IEnvSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionMasters { get; set; }
        public string CollectionEvents { get; set; }

        //public string LexonMySqlUrl { get; set; }
        //public string LexonFilesUrl { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }
        public long IdAppNavision { get; set; }

        public EnvironmentModel[] EnvModels { get; set; }
        public string[] Environments { get; set; }
        public string DefaultEnvironment { get; set; }

        public StoreProcedures SP { get; set; }

        public string Version { get; set; }

        public bool UseMongo { get; set; }
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

        public string GetAllContacts { get; set; }
        public string CheckRelations { get; set; }
        public string AddAppointment { get; set; }
        public string RemoveAppointment { get; set; }
        public string AddAppointmentAction { get; set; }
        public string RemoveAppointmentAction { get; set; }
        public string AddAction { get; set; }
        public string GetActuationTypes { get; set; }
        public string GetActuationCategories { get; set; }
        public string GetActuations { get; set; }
        public string SearchAppointmentRelations { get; set; }
        public string GetAdvisorFiles { get; set; }

 
    }
}