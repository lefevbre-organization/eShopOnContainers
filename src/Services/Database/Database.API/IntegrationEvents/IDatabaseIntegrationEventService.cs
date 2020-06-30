﻿using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.IntegrationsEvents
{
    public interface IDatabaseIntegrationEventService
    {
        Task SaveEventAndLexonContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}