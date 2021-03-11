using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.IntegrationsEvents
{
    public interface ICalendarIntegrationEventService
    {
        Task SaveEventAndLexonContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}