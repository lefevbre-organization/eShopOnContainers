namespace EmailUserAccount.API.IntegrationEvents.EventHandling
{
    #region Using

    using System;
    using System.Threading.Tasks;
    using Infrastructure.Repositories;
    using Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;

    #endregion

    public class AddOperationEmailUserAccountIntegrationEventHandler : IIntegrationEventHandler<AddOperationEmailUserAccountIntegrationEvent>
    {
        private readonly IAccountsRepository _repository;

        public AddOperationEmailUserAccountIntegrationEventHandler(
            IAccountsRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task Handle(AddOperationEmailUserAccountIntegrationEvent @event)
        {
            // await _repository.AddFileToListAsync(@event.UserId, @event.FileId, @event.FileName, @event.FileDescription);
        }
    }
}
