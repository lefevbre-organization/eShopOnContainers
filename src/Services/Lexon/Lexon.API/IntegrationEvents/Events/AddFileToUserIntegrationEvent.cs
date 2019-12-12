using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events
{
    public class AddFileToUserIntegrationEvent: IntegrationEvent
    {
        public string UserId { get; set; }

        public long CompanyId { get; set; }
        public long FileId { get; set; }

        public string FileName { get; set; }

        public string FileDescription { get; set; }


        public AddFileToUserIntegrationEvent(
            string userId,
            long companyId,
            long fileId,
            string fileName,
            string fileDescription
            )
        {
            UserId = userId;
            CompanyId = companyId;
            FileId = fileId;
            FileName = fileName;
            FileDescription = fileDescription;
        }


    }
}
