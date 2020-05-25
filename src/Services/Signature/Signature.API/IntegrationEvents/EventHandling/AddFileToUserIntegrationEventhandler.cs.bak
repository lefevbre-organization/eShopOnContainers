using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.IntegrationsEvents.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;

namespace Lexon.API.IntegrationsEvents.EventHandling
{
    public class AddFileToUserIntegrationEventHandler: IIntegrationEventHandler<AddFileToUserIntegrationEvent>
    {
        private readonly IUsersRepository _repository;

        public AddFileToUserIntegrationEventHandler(
            IUsersRepository repository
            )
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task Handle(AddFileToUserIntegrationEvent @event)
        {
            await _repository.AddFileToListAsync(@event.UserId, @event.CompanyId, @event.FileId, @event.FileName, @event.FileDescription);
        }
    }
}
