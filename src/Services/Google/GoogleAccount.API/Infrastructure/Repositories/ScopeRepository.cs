using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    using BuidingBlocks.Lefebvre.Models;
    using Infrastructure.Exceptions;
    using Model;
    public class ScopeRepository : BaseClass<ScopeRepository>, IScopeRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;

        public ScopeRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<ScopeRepository> logger
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleAccountContext(settings, eventBus);
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

                await _context.ScopeGoogleAccounts.InsertOneAsync(scope);

                TraceInfo(result.infos, "Create Scope Success!");

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
                var resultDeleteMongo = await _context.ScopeGoogleAccounts.DeleteOneAsync(GetFilterScopeForId(ScopeId, false));

                if (resultDeleteMongo.IsAcknowledged && resultDeleteMongo.DeletedCount > 0)
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
               var scopes = await _context.ScopeGoogleAccounts.Find(GetFilterScopeForProduct(product)).ToListAsync();
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