using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB
{

    public class IntegrationEventLogSettings
    {
        public string ConnectionString { get; set; }
        public string Database { get; set; }

    }
}
