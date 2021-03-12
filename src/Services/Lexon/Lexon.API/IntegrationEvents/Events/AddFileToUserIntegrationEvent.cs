using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events
{
    public record AddFileToUserIntegrationEvent : IntegrationEvent
    {
        public string UserId { get; set; }

        public string Bbdd { get; set; }
        public long FileId { get; set; }

        public string FileName { get; set; }

        public string FileDescription { get; set; }

        public AddFileToUserIntegrationEvent(
            string userId,
            string bbdd,
            long fileId,
            string fileName,
            string fileDescription
            )
        {
            UserId = userId;
            Bbdd = bbdd;
            FileId = fileId;
            FileName = fileName;
            FileDescription = fileDescription;
        }
    }
}