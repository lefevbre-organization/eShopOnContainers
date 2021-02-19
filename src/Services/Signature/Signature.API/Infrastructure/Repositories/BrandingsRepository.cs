namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    #region using
    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Driver;
    using System;
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
                    TraceError(result.errors, new Exception($"No se encuentra ningún template con los datos facilitados"), "SG04");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}", "SG04");
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
                    TraceError(result.errors, new Exception($"No se encuentra ningún branding con los datos facilitados"), "SG05");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}", "SG05");
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
                    TraceError(result.errors, new Exception($"No se encuentra ningún branding con los datos facilitados"), "SG06");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}", "SG06");
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

                brandingIn.Id = ManageCreateMessage(
                    $"Branding don't inserted {brandingIn.app}, type {brandingIn.type}",
                    $"Branding already existed and it's been modified {brandingIn.app}, type {brandingIn.type}",
                    $"Branding inserted {brandingIn.app} type {brandingIn.type}",
                    result.infos, result.errors, resultReplace, "SG01");

                result.data = brandingIn;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar el branding {brandingIn.app}, type {brandingIn.type}", "SG01");
                throw;
            }
            return result;
        }

        public async Task<Result<BaseBrandings>> CreateBrandingTest(BaseBrandings brandingIn)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterBranding(brandingIn.app, brandingIn.type);

            try
            {
                var resultReplace = await _context.TestBrandings.ReplaceOneAsync(filter, brandingIn, GetUpsertOptions());

                brandingIn.Id = ManageCreateMessage(
                    $"Branding don't inserted {brandingIn.app}, type {brandingIn.type}",
                    $"Branding already existed and it's been modified {brandingIn.app}, type {brandingIn.type}",
                    $"Branding inserted {brandingIn.app} type {brandingIn.type}",
                    result.infos, result.errors, resultReplace, "SG02");

                result.data = brandingIn;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar el branding {brandingIn.app}, type {brandingIn.type}", "SG02");
                throw;
            }
            return result;
        }

        public async Task<Result<BaseBrandings>> GetTemplateBrandingTest(string app)
        {
            var result = new Result<BaseBrandings>();
            var filter = GetFilterBranding(app, "template");
            try
            {
                result.data = await _context.TestBrandings.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún template con los datos facilitados"), "SG09");
                }
                else
                {
                    var branding = result.data;

                    result.data = branding;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de : {ex.Message}", "SG09");
            }
            return result;
        }

        #endregion

    }
}
