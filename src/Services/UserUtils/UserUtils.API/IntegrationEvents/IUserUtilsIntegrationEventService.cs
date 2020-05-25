using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.IntegrationsEvents
{
    public interface IUserUtilsIntegrationEventService
    {
        Task SaveEventAndLexonContextChangesAsync(IntegrationEvent evt);
        Task PublishThroughEventBusAsync(IntegrationEvent evt);
    }


}