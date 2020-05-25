namespace Signature.API.Infrastructure.Repositories
{
    #region using
    using Signature.API.IntegrationsEvents.Events;
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Events;
    using Microsoft.eShopOnContainers.BuildingBlocks.IntegrationEventLogMongoDB;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    #endregion
    public class BrandingsRepository : BaseClass<BrandingsRepository>, IBrandingsRepository
    {
        private readonly SignatureContext _context;
        private readonly IOptions<SignatureSettings> _settings;

        #region ctors
        public BrandingsRepository(
                      IOptions<SignatureSettings> settings
                    //, IEventBus eventBus
                    , ILogger<BrandingsRepository> logger

                    ) : base(logger)
        {
            _settings = settings;
            _context = new SignatureContext(settings);//, eventBus);
        }
        #endregion

        #region Filters
        //private static FilterDefinition<UserSignatures> GetFilterLexUser(string user)
        //{
        //    return
        //        Builders<UserSignatures>.Filter.And(
        //            Builders<UserSignatures>.Filter.Eq(u => u.User, user)
        //        );
        //}

        //private static FilterDefinition<Signature> GetFilterSignature(string externalId)
        //{
        //    return Builders<Signature>.Filter.And(Builders<Signature>.Filter.Eq(u => u.externalId, externalId));
        //}

        //private static FilterDefinition<UserSignatures> GetFilterUser(string user)
        //{
        //    return Builders<UserSignatures>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        //}

        private static FilterDefinition<BaseBrandings> GetFilterBranding(string app, string type)
        {
            return Builders<BaseBrandings>.Filter.Eq(b => b.app, app.ToLowerInvariant())
                & Builders<BaseBrandings>.Filter.Eq(b => b.type, type.ToLowerInvariant());
        }

        private static FilterDefinition<BaseBrandings> GetFilterUserBranding(string app, string type, string id)
        {
            return Builders<BaseBrandings>.Filter.Eq(a => a.app, app.ToLowerInvariant())
                & Builders<BaseBrandings>.Filter.Eq(t => t.type, type.ToLowerInvariant())
                & Builders<BaseBrandings>.Filter.Eq(i => i.id_signaturit, type.ToLowerInvariant());
        }


        //private static Predicate<Signature> GetFilterUserSignature(string externalId, string guid)
        //{
        //    return x => x.externalId.Equals(externalId.ToLowerInvariant())
        //                            && x.guid.Equals(guid.ToUpperInvariant());
        //}

        //private static Predicate<Signature> GetFilterUserSignatureGuid(string guid)
        //{
        //    return x => x.guid.Equals(guid.ToUpperInvariant());
        //}


        #endregion

        #region Actions

        public async Task<Result<BaseBrandings>> GetTemplateBranding(string app)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterBranding(app, "template");
            try
            {
                result.data = await _context.Brandings.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún template con los datos facilitados"), "1003");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}");
            }
            return result;
        }

        public async Task<Result<BaseBrandings>> GetDefaultBranding(string app)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterBranding(app, "default");
            try
            {
                result.data = await _context.Brandings.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún branding con los datos facilitados"), "1003");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}");
            }
            return result;
        }

        public async Task<Result<BaseBrandings>> GetUserBranding(string app, string id)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterUserBranding(app, "user", id);
            try
            {
                result.data = await _context.Brandings.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún branding con los datos facilitados"), "1003");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}");
            }
            return result;
        }

        public async Task<Result<BaseBrandings>> CreateBranding(BaseBrandings brandingIn)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterBranding(brandingIn.app, brandingIn.type);

            try
            {
                var resultReplace = await _context.Brandings.ReplaceOneAsync(filter, brandingIn, GetUpsertOptions());

                brandingIn.Id = ManageCreateBranding($"Branding don't inserted {brandingIn.app}, type {brandingIn.type}",
                    $"Branding already existed and it's been modified {brandingIn.app}, type {brandingIn.type}",
                    $"Branding inserted {brandingIn.app} type {brandingIn.type}",
                    result, resultReplace);

                result.data = brandingIn;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar el branding {brandingIn.app}, type {brandingIn.type}");
                throw;
            }
            return result;
        }
        #endregion

        #region Helpers
        private static UpdateOptions GetUpsertOptions()
        {
            return new UpdateOptions { IsUpsert = true };
        }

        private string ManageCreateBranding(string msgError, string msgModify, string msgInsert, Result<BaseBrandings> result, ReplaceOneResult resultReplace)
        {
            if (resultReplace.IsAcknowledged)
            {
                if (resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                {
                    TraceInfo(result.infos, msgModify);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(result.infos, msgInsert);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceMessage(result.errors, new Exception(msgError), "1003");
            }
            return null;
        }
        #endregion

    }
}
