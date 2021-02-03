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
using MongoDB.Driver;

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

        private async Task<GoogleAccountScope> GetScopeForId(string scopeId)
        {
            return await _context.ScopeGoogleAccounts.Find(GetFilterScopeForId(scopeId)).FirstOrDefaultAsync();
        }

        private async Task<List<GoogleAccountScope>> GetScopesForProduct(GoogleProduct product)
        {
            return await _context.ScopeGoogleAccounts.Find(GetFilterScopeForProduct(product)).ToListAsync();
        }

        private static FilterDefinition<GoogleAccountScope> GetFilterScopeForId(string scopeId, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountScope>.Filter.And(
                Builders<GoogleAccountScope>.Filter.Eq(u => u.Id, scopeId.ToUpperInvariant()),
                Builders<GoogleAccountScope>.Filter.Eq(u => u.state, true));

            }
            return Builders<GoogleAccountScope>.Filter.Eq(u => u.Id, scopeId.ToUpperInvariant());
        }

        private static FilterDefinition<GoogleAccountScope> GetFilterScopeForProduct(GoogleProduct product, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountScope>.Filter.And(
                Builders<GoogleAccountScope>.Filter.Eq(u => u.Product, product),
                Builders<GoogleAccountScope>.Filter.Eq(u => u.state, true));

            }
            return Builders<GoogleAccountScope>.Filter.Eq(u => u.Product, product);
        }

        public async Task<Result<GoogleAccountScope>> CreateScope(GoogleAccountScope scope)
        {
            Result<GoogleAccountScope> result = new Result<GoogleAccountScope>();

            try
            {
                // TODO Guardar Scope

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

                GoogleAccountScope scope = await GetScopeForId(ScopeId);

                if(scope == null)
                {
                    return result;
                }

                // TODO Remover Scope

                result.data = true;

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException("Error", ex));
            }

            return result;
        }

        public async Task<Result<List<GoogleAccountScope>>> GetScopes(GoogleProduct product)
        {
            Result<List<GoogleAccountScope>> result = new Result<List<GoogleAccountScope>>();

            try
            {
                List<GoogleAccountScope> scopes = await GetScopesForProduct(product);
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
