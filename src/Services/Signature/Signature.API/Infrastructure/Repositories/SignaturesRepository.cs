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
    public class SignaturesRepository : BaseClass<SignaturesRepository>, ISignaturesRepository
    {
        private readonly SignatureContext _context;
        private readonly IOptions<SignatureSettings> _settings;

        #region ctors
        public SignaturesRepository(
                      IOptions<SignatureSettings> settings
                    //, IEventBus eventBus
                    , ILogger<SignaturesRepository> logger

                    ) : base(logger)
        {
            _settings = settings;
            _context = new SignatureContext(settings);//, eventBus);
        }
        #endregion

        #region Filters
        private static FilterDefinition<UserSignatures> GetFilterLexUser(string user)
        {
            return
                Builders<UserSignatures>.Filter.And(
                    Builders<UserSignatures>.Filter.Eq(u => u.User, user)
                );
        }

        private static FilterDefinition<Signature> GetFilterSignature(string externalId)
        {
            return Builders<Signature>.Filter.And(Builders<Signature>.Filter.Eq(u => u.externalId, externalId));
        }

        private static FilterDefinition<UserSignatures> GetFilterUser(string user)
        {
            return Builders<UserSignatures>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        }

        private static Predicate<Signature> GetFilterUserSignature(string externalId, string guid)
        {
            return x => x.externalId.Equals(externalId.ToLowerInvariant())
                                    && x.guid.Equals(guid.ToUpperInvariant());
        }

        private static Predicate<Signature> GetFilterUserSignatureGuid(string guid)
        {
            return x => x.guid.Equals(guid.ToUpperInvariant());
        }

        private static Predicate<UserBranding> GetFilterUserBranding(string app)
        {
            return x => x.app.Equals(app.ToLowerInvariant()); 
        }

        #endregion

        #region Actions
        public async Task<Result<UserSignatures>> GetUser(string user)
        {
            var result = new Result<UserSignatures>();
            var filter = GetFilterUser(user);
            try
            {
                result.data = await _context.Signatures.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ninguna firma para el usuario {user}"), "1003");
                }
                else
                {
                    var signatures = result.data?.signatures.ToList();

                    result.data.signatures = signatures;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {user}: {ex.Message}");
            }
            return result;
        }

        public async Task<Result<UserSignatures>> Create(UserSignatures userSignature)
        {
            var result = new Result<UserSignatures>();
            var filter = GetFilterUser(userSignature.User);

            try
            {
                var resultReplace = await _context.Signatures.ReplaceOneAsync(filter, userSignature, GetUpsertOptions());

                userSignature.Id = ManageCreateSignature($"User don't inserted {userSignature.User}",
                    $"User already existed and it's been modified {userSignature.User}",
                    $"User inserted {userSignature.User}",
                    result, resultReplace);

                result.data = userSignature;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar la firma {userSignature.User}");
                throw;
            }
            return result;
        }

        public async Task<Result<bool>> Remove(string user)
        {
            var result = new Result<bool>();
            var filter = GetFilterUser(user);
            try
            {
                var resultRemove = await _context.Signatures.DeleteOneAsync(filter);
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {user}");
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<bool>> UpSertSignature(string user, Signature signatureIn)
        {
            var result = new Result<bool>();
            //ReviewAccountMail(accountIn);

            try
            {
                var userSignature = GetNewUserSignature(user, signatureIn.externalId, signatureIn.guid, signatureIn.app);

                var userDb = await _context.Signatures.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userSignature;
                    TraceInfo(result.infos, $"Se inserta el usuario {userSignature.User}");
                }
                else
                {
                    OperateChanguesInUserAccounts(user, signatureIn, result, userDb);
                }
                var resultReplace = await _context.Signatures.ReplaceOneAsync(GetFilterUser(userSignature.User), userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            result.data = true;
            return result;
        }

        public async Task<Result<bool>> DeleteSignature(string id)
        {
            var result = new Result<bool>();
            try
            {
                //var resultRemove = await _context.Signatures.DeleteOneAsync(GetFilterSignature(id));
                //result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {id}");
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<int>> AddAvailableSignatures(string user, int num)
        {
            var result = new Result<int>();
            var userInfo = new Result<UserSignatures>();

            var filter = GetFilterUser(user);

            try
            {
                //First, current availableSignatures value is retrieved
                userInfo.data = await _context.Signatures.Find(filter).FirstOrDefaultAsync();

                if (userInfo.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra información del usuario {user}"), "1003");
                }
                else
                {
                    var availableSignatures = userInfo.data.availableSignatures;

                    //Second, update availableSignatures adding the new ones to existing ones
                    var resultUpdate = await _context.Signatures.UpdateOneAsync(
                        filter,
                        Builders<UserSignatures>.Update.Set(x => x.availableSignatures, num + availableSignatures)
                    );
                    if (resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0)
                    {
                        result.data = num + availableSignatures;
                        TraceInfo(result.infos, $"Se han actualizado correctamente las firmas disponibles de {user}");
                    }
                    else
                    {
                        TraceInfo(result.infos, $"No se han podido actualizar las firmas disponibles de {user}");
                        result.data = 0;
                    }
                }
            }
            catch (Exception ex)
            {

                TraceMessage(result.errors, ex);
            }
            return result;
        }

        //public async Task<Result<int>> DecAvailableSignatures(string user)
        //{
        //    var result = new Result<int>();
        //    var userInfo = new Result<UserSignatures>();

        //    var filter = GetFilterUser(user);

        //    try
        //    {
        //        //First, current availableSignatures value is retrieved
        //        userInfo.data = await _context.Signatures.Find(filter).FirstOrDefaultAsync();

        //        if (userInfo.data == null)
        //        {
        //            TraceMessage(result.errors, new Exception($"No se encuentra información del usuario {user}"), "1003");
        //        }
        //        else
        //        {
        //            var availableSignatures = userInfo.data.availableSignatures;

        //            //Second, update availableSignatures adding the new ones to existing ones
        //            var resultUpdate = await _context.Signatures.UpdateOneAsync(
        //                filter,
        //                Builders<UserSignatures>.Update.Set(x => x.availableSignatures, availableSignatures - 1)
        //            );
        //            if (resultUpdate.IsAcknowledged && resultUpdate.ModifiedCount > 0)
        //            {
        //                result.data = num + availableSignatures;
        //                TraceInfo(result.infos, $"Se han actualizado correctamente las firmas disponibles de {user}");
        //            }
        //            else
        //            {
        //                TraceInfo(result.infos, $"No se han podido actualizar las firmas disponibles de {user}");
        //                result.data = 0;
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {

        //        TraceMessage(result.errors, ex);
        //    }
        //    return result;
        //}

        public async Task<Result<int>> GetAvailableSignatures(string user)
        {
            var result = new Result<int>();
            var userInfo = new Result<UserSignatures>();

            var filter = GetFilterUser(user);

            try
            {
                //First, current availableSignatures value is retrieved
                userInfo.data = await _context.Signatures.Find(filter).FirstOrDefaultAsync();

                if (userInfo.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra información del usuario {user}"), "1003");
                }
                else
                {
                    result.data = userInfo.data.availableSignatures;
                }
            }
            catch (Exception ex)
            {

                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn)
        {
            var result = new Result<bool>();
            //ReviewAccountMail(accountIn);

            try
            {
                var userSignature = GetNewUserSignature(user);

                var userDb = await _context.Signatures.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userSignature;
                    TraceInfo(result.infos, $"Se inserta el branding {brandingIn.app} con id {brandingIn.externalId} para el usuario {user}");
                }
                else
                {
                    OperateChanguesInUserBrandings(user, brandingIn, result, userDb);
                }
                var resultReplace = await _context.Signatures.ReplaceOneAsync(GetFilterUser(userSignature.User), userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            result.data = true;
            return result;
        }

        #endregion

        #region Helpers
        private static UpdateOptions GetUpsertOptions()
        {
            return new UpdateOptions { IsUpsert = true };
        }

        private string ManageCreateSignature(string msgError, string msgModify, string msgInsert, Result<UserSignatures> result, ReplaceOneResult resultReplace)
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

        private UserSignatures GetNewUserSignature(string user, string externalId, string guid, string app)
        {
            return new UserSignatures()
            {
                User = user.ToUpperInvariant(),
                availableSignatures = 0,
                brandings = new List<UserBranding>(),
                signatures = new List<Signature>() {
                        new Signature() {externalId = externalId, guid= guid, app= app.ToLowerInvariant()}
                    }
            };
        }

        private UserSignatures GetNewUserSignature(string user)
        {
            return new UserSignatures()
            {
                User = user.ToUpperInvariant(),
                availableSignatures = 0,
                brandings = new List<UserBranding>(),
                signatures = new List<Signature>()
            };
        }

        private void OperateChanguesInUserAccounts(string user, Signature signatureIn, Result<bool> result, UserSignatures userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            var signatureDb = userDb.signatures.Find(GetFilterUserSignatureGuid(signatureIn.guid));
            

            if (signatureDb == null)
            {
                userDb.signatures.Add(signatureIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo una firma para {signatureIn.externalId}-{signatureIn.guid}-{signatureIn.app}");
            }
            else
            {
                UpdateSignatureWithOther(signatureIn, signatureDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la firma para {signatureIn.externalId}-{signatureDb.externalId}");
            }
        }

        private void OperateChanguesInUserBrandings(string user, UserBranding brandingIn, Result<bool> result, UserSignatures userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            
            var brandingDb = userDb.brandings.Find(GetFilterUserBranding(brandingIn.app));

            if (brandingDb == null)
            {
                userDb.brandings.Add(brandingIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo un branding para {brandingIn.app}-{brandingIn.externalId}");
            }
            else
            {
                UpdateBrandingWithOther(brandingIn, brandingDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando el branding para {brandingIn.app}-{brandingIn.externalId}");
            }
        }

        private static void UpdateSignatureWithOther(Signature signatureIn, Signature signatureDb)
        {
            signatureDb.externalId = signatureIn.externalId;
            signatureDb.guid = signatureIn.guid;
            signatureDb.app = signatureIn.app;
        }

        private static void UpdateBrandingWithOther(UserBranding brandingIn, UserBranding brandingDb)
        {
            brandingDb.app = brandingIn.app;
            brandingDb.externalId = brandingIn.externalId;
        }
        #endregion

    }
}