using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class CredentialRepository : BaseClass<CredentialRepository>
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public CredentialRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<CredentialRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }


        public async Task<Result<UserResponse>> GetUserCredential(Guid LefebvreCredential)
        {

            Result<UserResponse> result = new Result<UserResponse>();

            try
            {
                User user = await context.Users.Include(x => x.Credentials).SingleOrDefaultAsync(x => x.Id == LefebvreCredential);

                if (user == null)
                    return result;

                List<UserCredentialResponse> list = new List<UserCredentialResponse>();


            }
            catch (Exception ex)
            {

            }

        }



    }
}