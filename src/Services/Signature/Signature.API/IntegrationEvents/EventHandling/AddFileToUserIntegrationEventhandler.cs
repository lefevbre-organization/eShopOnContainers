using System;
using System.Threading.Tasks;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Serilog.Context;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.IntegrationsEvents.EventHandling
{
    using Infrastructure.Repositories;
    using Events;
    public class AddFileToUserIntegrationEventHandler: IIntegrationEventHandler<AddFileToUserIntegrationEvent>
    {
        private readonly ISignaturesRepository _repository;
        private readonly ILogger<AddFileToUserIntegrationEventHandler> _logger;

        public AddFileToUserIntegrationEventHandler(
            ISignaturesRepository repository,
            ILogger<AddFileToUserIntegrationEventHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task Handle(AddFileToUserIntegrationEvent @event)
        {
           // await _repository.AddFileToListAsync(@event.UserId, @event.Bbdd, @event.FileId, @event.FileName, @event.FileDescription);
            using (LogContext.PushProperty("IntegrationEventContext", $"{@event.Id}-{Program.AppName}"))
            {
                _logger.LogInformation("----- Handling integration event: {IntegrationEventId} at {AppName} - ({@IntegrationEvent})", @event.Id, Program.AppName, @event);
               // await _repository.AddFileToListAsync(@event.UserId, @event.Bbdd, @event.FileId, @event.FileName, @event.FileDescription);
            
            }
        }
    }
}
