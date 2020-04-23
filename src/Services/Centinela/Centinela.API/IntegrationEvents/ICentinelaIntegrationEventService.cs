using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Centinela.API.IntegrationsEvents
{
    public interface ICentinelaIntegrationEventService
    {
        Task SaveEventAndLexonContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}