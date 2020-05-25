﻿using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Signature.API.Infrastructure.Repositories;
using Signature.API.IntegrationsEvents.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Serilog.Context;

namespace Signature.API.IntegrationsEvents.EventHandling
{
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
