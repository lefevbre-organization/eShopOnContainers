using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Context;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    public class ScopeRepository : BaseClass<ScopeRepository>, IScopeRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;
        private readonly ApplicationDbContext context;

        public ScopeRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<ScopeRepository> logger
            , ApplicationDbContext context
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            this.context = context;
            _context = new GoogleAccountContext(settings, eventBus);
        }


        public async Task<Result<Scope>> CreateScope(Scope scope)
        {
            Result<Scope> result = new Result<Scope>();

            try
            {
                await context.Scopes.AddAsync(scope);
                await context.SaveChangesAsync();
                result.data = scope;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

        public async Task<Result<bool>> DeleteScope(string ScopeId)
        {
            Result<bool> result = new Result<bool>(false);

            try
            {

                Scope scope = await context.Scopes.FirstOrDefaultAsync(x => x.Id == Guid.Parse(ScopeId));

                if(scope == null)
                {
                    return result;
                }

                context.Scopes.Remove(scope);
                await context.SaveChangesAsync();

                result.data = true;

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

        public async Task<Result<List<Scope>>> GetScopes(GoogleProduct product)
        {
            Result<List<Scope>> result = new Result<List<Scope>>();

            try
            {
                List<Scope> scopes = await context.Scopes.Where(x => x.Product == product).ToListAsync();
                result.data = scopes;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

    }
}
