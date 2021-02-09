using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Drive.API.Infrastructure.Repositories
{
    using Exceptions;
    using Model;

    public class GoogleDriveRepository : BaseClass<GoogleDriveRepository>, IGoogleDriveRepository
    {
        private readonly GoogleDriveContext _context;
        private readonly IOptions<GoogleDriveSettings> _settings;
        private readonly IEventBus _eventBus;

        public GoogleDriveRepository(
              IOptions<GoogleDriveSettings> settings
            , IEventBus eventBus
            , ILogger<GoogleDriveRepository> logger

            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleDriveContext(settings, eventBus);
        }






    }
}