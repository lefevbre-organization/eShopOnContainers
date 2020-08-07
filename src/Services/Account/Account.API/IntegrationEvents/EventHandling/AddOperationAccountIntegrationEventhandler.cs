namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.IntegrationEvents.EventHandling
{
    #region Using

    using System;
    using System.Threading.Tasks;
    using Infrastructure.Repositories;
    using Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;

    #endregion

    public class AddOperationAccountIntegrationEventHandler : IIntegrationEventHandler<AddOperationAccountIntegrationEvent>
    {
        private readonly IAccountsRepository _repository;

        public AddOperationAccountIntegrationEventHandler(
            IAccountsRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task Handle(AddOperationAccountIntegrationEvent @event)
        {
            // await _repository.AddFileToListAsync(@event.UserId, @event.FileId, @event.FileName, @event.FileDescription);
        }
    }
}
