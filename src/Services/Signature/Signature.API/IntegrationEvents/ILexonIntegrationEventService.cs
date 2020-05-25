using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Signature.API.IntegrationsEvents
{
    public interface ISignatureIntegrationEventService
    {
        Task SaveEventAndSignatureContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}