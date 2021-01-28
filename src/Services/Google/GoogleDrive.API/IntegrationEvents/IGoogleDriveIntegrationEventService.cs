using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.API.IntegrationsEvents
{
    public interface IGoogleDriveIntegrationEventService
    {
        Task SaveEventAndLexonContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}