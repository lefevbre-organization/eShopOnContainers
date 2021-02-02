﻿using System;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class RevokeRepository : BaseClass<RevokeRepository>
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public RevokeRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<RevokeRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }
    }
}
