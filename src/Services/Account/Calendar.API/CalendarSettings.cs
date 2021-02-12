
namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API
{
    public class CalendarSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }
        public string Collection { get; set; }
        public string CollectionCalendar { get; set; }
        public string CollectionEvents { get; set; }


        //public string UserUtilsUrl { get; set; }


        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }

        public long IdAppNavision { get; set; }
        public short Version { get; set; }
    }
}