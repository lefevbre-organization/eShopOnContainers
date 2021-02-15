using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Lefebvre.eLefebvreOnContainers.Services.Google.Account.API.Infrastructure.Repositories
{
    using Infrastructure.Exceptions;
    using Model;
    public class RevokeRepository : BaseClass<RevokeRepository>, IRevokeRepository
    {
        private readonly GoogleAccountContext _context;
        private readonly IOptions<GoogleAccountSettings> _settings;
        private readonly IEventBus _eventBus;

        public RevokeRepository(
              IOptions<GoogleAccountSettings> settings
            , IEventBus eventBus
            , ILogger<RevokeRepository> logger
            ) : base(logger)
        {
            _settings = settings;
            _eventBus = eventBus;
            _context = new GoogleAccountContext(settings, eventBus);
        }

        private async Task<GoogleAccountUser> GetUser(string LefebvreCredential)
        {
            return await _context.UserGoogleAccounts.Find(GetFilterUser(LefebvreCredential)).FirstOrDefaultAsync();
        }

        private static FilterDefinition<GoogleAccountUser> GetFilterUser(string LefebvreCredential, bool onlyValid = true)
        {
            if (onlyValid)
            {
                return Builders<GoogleAccountUser>.Filter.And(
                Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential.ToUpperInvariant()),
                Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true));
            }

            return Builders<GoogleAccountUser>.Filter.Eq(u => u.Id, LefebvreCredential.ToUpperInvariant());
        }


        private static List<ArrayFilterDefinition> GetFilterFromCredentials(int product)
        {
            var arrayFilters = new List<ArrayFilterDefinition>();
            var dictionary = new Dictionary<string, int>
            {
                { "i.product", product }
            };
            var doc = new BsonDocument(dictionary);
            var docarrayFilter = new BsonDocumentArrayFilterDefinition<BsonDocument>(doc);
            arrayFilters.Add(docarrayFilter);
            return arrayFilters;
        }

        public async Task<Result<bool>> GetRevokingDriveCredentialAsync(string LefebvreCredential, GoogleProduct idProduct = GoogleProduct.Drive)
        {
            Result<bool> result = new Result<bool>();

            try
            {

                var update = Builders<GoogleAccountUser>.Update
                    .Set("Credentials.$.Access_Token", "")
                    .Set("Credentials.$.Refresh_Token", "")
                    .Set("Credentials.$.Code", ""); 
                
                var resultUpdate = await _context.UserGoogleAccounts.UpdateOneAsync(
                        Builders<GoogleAccountUser>.Filter.And(
                          Builders<GoogleAccountUser>.Filter.Eq(u => u.LefebvreCredential, LefebvreCredential),
                          Builders<GoogleAccountUser>.Filter.Eq(u => u.state, true),
                          Builders<GoogleAccountUser>.Filter.ElemMatch(u => u.Credentials, Builders<Credential>.Filter.Eq(c=> c.Product, idProduct))
                        ),
                        update
                );

                result.data = ManageUpdate($"Don´t change de Credential in {LefebvreCredential}",
                    $"Credential revoke in {LefebvreCredential}",
                    result, resultUpdate, "GA10");

            }
            catch (Exception ex)
            {
                TraceError(result.errors, new GoogleAccountDomainException(ex.Message));
            }

            return result;
        }
    }
}
