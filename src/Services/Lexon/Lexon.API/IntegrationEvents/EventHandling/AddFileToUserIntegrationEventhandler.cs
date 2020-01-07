using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Serilog.Context;
using System;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.EventHandling
{
    public class AddFileToUserIntegrationEventHandler : IIntegrationEventHandler<AddFileToUserIntegrationEvent>
    {
        private readonly IUsersRepository _repository;
        private readonly ILogger<AddFileToUserIntegrationEventHandler> _logger;

        public AddFileToUserIntegrationEventHandler(
            IUsersRepository repository,
            ILogger<AddFileToUserIntegrationEventHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task Handle(AddFileToUserIntegrationEvent @event)
        {
            await _repository.AddFileToListAsync(@event.UserId, @event.Bbdd, @event.FileId, @event.FileName, @event.FileDescription);
            using (LogContext.PushProperty("IntegrationEventContext", $"{@event.Id}-{Program.AppName}"))
            {
                _logger.LogInformation("----- Handling integration event: {IntegrationEventId} at {AppName} - ({@IntegrationEvent})", @event.Id, Program.AppName, @event);
                await _repository.AddFileToListAsync(@event.UserId, @event.Bbdd, @event.FileId, @event.FileName, @event.FileDescription);
                //await _repository.DeleteBasketAsync(@event.UserId.ToString());
            }
        }
    }
}