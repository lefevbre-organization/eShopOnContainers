﻿namespace Lefebvre.eLefebvreOnContainers.Services.Account.API
{
    public class AccountSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }

        public string EventBusConnection { get; set; }
        public string EventBusUserName { get; set; }
        public string EventBusPassword { get; set; }
        public int EventBusPort { get; set; }
        public short EventBusRetryCount { get; set; }

        public bool UseCustomizationData { get; set; }

        public bool AzureStorageEnabled { get; set; }

        public EventBusSettings EventBus { get; set; }
        public string Collection { get;  set; }
        public string CollectionRaw { get;  set; }
        public string CollectionCalendar { get; set; }
        public string CollectionEvents { get; set; }
    }
}