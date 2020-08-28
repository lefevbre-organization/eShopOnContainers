﻿namespace Signature.API.Infrastructure.Repositories
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
    using Microsoft.WindowsAzure.Storage;
    using System.Net.NetworkInformation;

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

        private static ProjectionDefinition<UserSignatures> GetProjectSignature(string externalId)
        {
            //return Builders<UserSignatures>.Projection.Include(u => u.User).Include(u => u.signatures).Exclude(u => u.Id);
            //return Builders<UserSignatures>.Projection.ElemMatch(u => u.signatures, sig => sig.externalId == externalId).Include(u => u.User).Include(u => u.signatures).Exclude(u => u.Id);
            return Builders<UserSignatures>.Projection.Include(u => u.User).ElemMatch(u => u.Signatures, sig => sig.ExternalId == externalId).Exclude(u => u.Id);
        }

        private static FilterDefinition<UserSignatures> GetFilterSignature(string externalId)
        {
            return Builders<UserSignatures>.Filter.ElemMatch(u => u.Signatures, sig => sig.ExternalId == externalId);
        }

        private static FilterDefinition<UserSignatures> GetFilterUser(string user)
        {
            return Builders<UserSignatures>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        }
        
        private static FilterDefinition<SignEventInfo> GetFilterEvents(string signatureId)
        {
            return Builders<SignEventInfo>.Filter.Eq(u => u.Document.Signature.Id, signatureId);

            //return Builders<SignEventInfo>.Filter.ElemMatch(u => u.Signature.Id, signatureId);

            //return Builders<SignEventInfo>.Filter.ElemMatch(u => u.Signature, ev => ev._id == signatureId);

        }


        private static Predicate<Signature> GetFilterUserSignature(string externalId, string guid)
        {
            return x => x.ExternalId.Equals(externalId.ToLowerInvariant())
                                    && x.Guid.Equals(guid.ToUpperInvariant());
        }

        private static Predicate<Signature> GetFilterUserSignatureGuid(string guid)
        {
            return x => x.Guid.Equals(guid.ToUpperInvariant());
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
                    var signatures = result.data?.Signatures.ToList();

                    result.data.Signatures = signatures;
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
                var userSignature = GetNewUserSignature(user, signatureIn.ExternalId, signatureIn.Guid, signatureIn.App, signatureIn.Documents);

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
                    var availableSignatures = userInfo.data.AvailableSignatures;

                    //Second, update availableSignatures adding the new ones to existing ones
                    var resultUpdate = await _context.Signatures.UpdateOneAsync(
                        filter,
                        Builders<UserSignatures>.Update.Set(x => x.AvailableSignatures, num + availableSignatures)
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
                    result.data = userInfo.data.AvailableSignatures;
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

        public async Task<Result<UserSignatures>> GetSignature(string signatureId)
        {
            var result = new Result<UserSignatures>();
            var filter = GetFilterSignature(signatureId);
            var project = GetProjectSignature(signatureId);
           
            try
            {
                //result.data = await _context.Signatures.Find(filter).Project(project).FirstOrDefaultAsync();
                //result.data = await _context.Signatures.Find(filter).Project(project).FirstOrDefaultAsync();
                result.data = BsonSerializer.Deserialize<UserSignatures>(await _context.Signatures.Find(filter).Project(project).FirstOrDefaultAsync());
                //result.data = await _context.Signatures.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ninguna firma para el id {signatureId}"), "1003");
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {signatureId}: {ex.Message}");
            }
            return result; 
        }

        public async Task<Result<bool>> SaveEvent(SignEventInfo eventInfo)
        {
            var result = new Result<bool>();

            try
            {
                await _context.SignatureEvents.InsertOneAsync(eventInfo);
                if (eventInfo.mongoId != null)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Evento recibido - {eventInfo.mongoId}");
                } else
                {
                    result.data = false;
                    TraceInfo(result.infos, $"Evento no se ha podido almacenar - {eventInfo.mongoId}");
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, new Exception($"No se ha podido guardar el evento - {eventInfo.mongoId} - {ex.Message}"), "2000");
            }
            return result;
        }

        public async Task<Result<List<SignEventInfo>>> GetEvents(string signatureId)
        {
            var result = new Result<List<SignEventInfo>>();
            var result2 = new Result<SignEventInfo>();
            var filter = GetFilterEvents(signatureId);
            try
            {
                if (signatureId == "all")
                {
                    
                    //result.data = BsonSerializer.Deserialize<SignEventInfo>(await _context.SignatureEvents.Find(filter).FirstOrDefaultAsync());
                    result.data = await _context.SignatureEvents.Find(f=> true).ToListAsync();
                }
                else
                {
                    //filter = new BsonDocument();
                    //result2.data = await _context.SignatureEvents.Find(filter).FirstOrDefaultAsync();
                    //result.data = new List<SignEventInfo>();
                    //result.data.Add(result2.data);

                    //result.data = new List<SignEventInfo>();
                    result.data = await _context.SignatureEvents.Find(filter).ToListAsync();
                    


                }
                

                if (result.data == null || result.data.Count == 0)
                {
                    TraceMessage(result.errors, new Exception($"No se encuentra ningún evento para la firma {signatureId}"), "1003");
                }
                else
                {
                    var events = result.data?.ToList();

                    result.data = events;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {signatureId}: {ex.Message}");
            }
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

        private UserSignatures GetNewUserSignature(string user, string externalId, string guid, string app, List<Document> documents)
        {
            

            return new UserSignatures()
            {
                User = user.ToUpperInvariant(),
                AvailableSignatures = 0,
                Brandings = new List<UserBranding>(),
                Signatures = new List<Signature>() {
                        new Signature() {
                            ExternalId = externalId, 
                            Guid= guid, 
                            App= app.ToLowerInvariant(),
                            Documents = documents
                        }
                    }
            };
        }

        private UserSignatures GetNewUserSignature(string user)
        {
            return new UserSignatures()
            {
                User = user.ToUpperInvariant(),
                AvailableSignatures = 0,
                Brandings = new List<UserBranding>(),
                Signatures = new List<Signature>()
            };
        }

        private void OperateChanguesInUserAccounts(string user, Signature signatureIn, Result<bool> result, UserSignatures userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            var signatureDb = userDb.Signatures.Find(GetFilterUserSignatureGuid(signatureIn.Guid));
            

            if (signatureDb == null)
            {
                userDb.Signatures.Add(signatureIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo una firma para {signatureIn.ExternalId}-{signatureIn.Guid}-{signatureIn.App}");
            }
            else
            {
                UpdateSignatureWithOther(signatureIn, signatureDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando la firma para {signatureIn.ExternalId}-{signatureDb.ExternalId}");
            }
        }

        private void OperateChanguesInUserBrandings(string user, UserBranding brandingIn, Result<bool> result, UserSignatures userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            
            var brandingDb = userDb.Brandings.Find(GetFilterUserBranding(brandingIn.app));

            if (brandingDb == null)
            {
                userDb.Brandings.Add(brandingIn);
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
            signatureDb.ExternalId = signatureIn.ExternalId;
            signatureDb.Guid = signatureIn.Guid;
            signatureDb.App = signatureIn.App;
        }

        private static void UpdateBrandingWithOther(UserBranding brandingIn, UserBranding brandingDb)
        {
            brandingDb.app = brandingIn.app;
            brandingDb.externalId = brandingIn.externalId;
        }
        #endregion

    }
}