namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    #region using
    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson.Serialization;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    #endregion

    public class SmsRepository : BaseClass<SmsRepository>, ISmsRepository
    {
        private readonly SignatureContext _context;
        private readonly IOptions<SignatureSettings> _settings;

        #region ctors
        public SmsRepository(
                      IOptions<SignatureSettings> settings
                    //, IEventBus eventBus
                    , ILogger<SmsRepository> logger

                    ) : base(logger)
        {
            _settings = settings;
            _context = new SignatureContext(settings);//, eventBus);
        }
        #endregion

        #region Filters
        private static FilterDefinition<UserSms> GetFilterUser(string user)
        {
            return Builders<UserSms>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        }

        private static FilterDefinition<CertifiedSms> GetFilterCertificate(string certificateId)
        {
            return Builders<CertifiedSms>.Filter.ElemMatch(c => c.Certificates, cert => cert.ExternalId == certificateId);
        }

        private static FilterDefinition<UserSms> GetFilterSms(string certificateId)
        {
            return Builders<UserSms>.Filter.ElemMatch(u => u.CertifiedSms, GetFilterCertificate(certificateId));
        }

        private static FilterDefinition<SmsEventInfo> GetFilterEvents(string certificateId)
        {
            return Builders<SmsEventInfo>.Filter.Eq(u => u.Certificate.CertificateId, certificateId);
        }

        private static Predicate<CertifiedSms> GetFilterUserSmsGuid(string guid)
        {
            return x => x.Guid.Equals(guid.ToUpperInvariant());
        }
        #endregion

        #region Projects
        private static ProjectionDefinition<UserSms> GetProjectSms(string certificateId)
        {
            return Builders<UserSms>.Projection.Include(u => u.User).ElemMatch(u => u.CertifiedSms, GetFilterCertificate(certificateId)).Exclude(u => u.Id);
        }
        #endregion

        #region Actions
        public async Task<Result<UserSms>> GetUser(string user)
        {
            var result = new Result<UserSms>();
            var filter = GetFilterUser(user);
            try
            {
                result.data = await _context.Sms.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún sms certificado del usuario {user}"), "SG33");
                }
                else
                {
                    var sms = result.data?.CertifiedSms.ToList();

                    result.data.CertifiedSms = sms;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {user}: {ex.Message}", "SG34");
            }
            return result;
        }

        public async Task<Result<List<UserSms>>> GetAll()
        {
            var result = new Result<List<UserSms>>();

            try
            {
                result.data = await _context.Sms.Find(f => true).ToListAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra información"), "SG35");
                }
                else
                {
                    var info = result.data?.ToList();
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos: {ex.Message}", "SG36"); ;
            }

            return result;
        }

        public async Task<Result<UserSms>> Create(UserSms userSms)
        {
            var result = new Result<UserSms>();
            var filter = GetFilterUser(userSms.User);

            try
            {
                var resultReplace = await _context.Sms.ReplaceOneAsync(filter, userSms, GetUpsertOptions());

                var id = ManageCreateMessage(
                    $"User don't inserted {userSms.User}",
                    $"User already existed and it's been modified {userSms.User}",
                    $"User inserted {userSms.User}",
                    result.infos, result.errors, resultReplace, "SG37");

                result.data = userSms;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar la firma {userSms.User}", "SG38");
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
                var resultRemove = await _context.Sms.DeleteOneAsync(filter);
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {user}", "SG39");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG40");
            }
            return result;
        }

        public async Task<Result<bool>> UpSertSms(string user, CertifiedSms smsIn)
        {
            var result = new Result<bool>();
            var filter = GetFilterUser(user);

            try
            {
                var userSms = GetNewUserSms(user, smsIn);

                var userDb = await _context.Sms.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userSms;
                    TraceInfo(result.infos, $"Se inserta el usuario {userSms.User}", "SG41");
                }
                else
                {
                    OperateChanguesInUserSms(user, smsIn, result, userDb);
                }
                var resultReplace = await _context.Sms.ReplaceOneAsync(filter, userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG42");
            }

            result.data = true;
            return result;
        }

        public async Task<Result<UserSms>> GetSms(string certificateId)
        {
            var result = new Result<UserSms>();
            var filter = GetFilterSms(certificateId);
            var project = GetProjectSms(certificateId);

            try
            {
                result.data = BsonSerializer.Deserialize<UserSms>(await _context.Sms.Find(filter).Project(project).FirstOrDefaultAsync());

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún sms certificado para el id {certificateId}"), "SG43");
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {certificateId}: {ex.Message} - {ex.StackTrace}", "SG44");
            }
            return result;
        }
        #endregion

        #region Events
        public async Task<Result<bool>> SaveEvent(SmsEventInfo eventInfo)
        {
            var result = new Result<bool>();

            try
            {
                await _context.SmsEvents.InsertOneAsync(eventInfo);
                if (eventInfo.mongoId != null)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Evento recibido - {eventInfo.mongoId}", "SG45");
                }
                else
                {
                    result.data = false;
                    TraceInfo(result.infos, $"Evento no se ha podido almacenar - {eventInfo.mongoId}", "SG46");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new Exception($"No se ha podido guardar el evento - {eventInfo.mongoId} - {ex.Message}"), "SG47");
            }
            return result;
        }

        public async Task<Result<List<SmsEventInfo>>> GetEvents(string certificateId)
        {
            var result = new Result<List<SmsEventInfo>>();
            var result2 = new Result<SmsEventInfo>();
            var filter = GetFilterEvents(certificateId);

            try
            {
                if (certificateId == "all")
                {

                    //result.data = BsonSerializer.Deserialize<SignEventInfo>(await _context.SignatureEvents.Find(filter).FirstOrDefaultAsync());
                    result.data = await _context.SmsEvents.Find(f => true).ToListAsync();
                }
                else
                {
                    result.data = await _context.SmsEvents.Find(filter).ToListAsync();
                }


                if (result.data == null || result.data.Count == 0)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún evento para el sms certificado {certificateId}"), "SG48");
                }
                else
                {
                    var events = result.data?.ToList();

                    result.data = events;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {certificateId}: {ex.Message}", "SG49");
            }
            return result;
        }
        #endregion

        #region Helpers

        private UserSms GetNewUserSms(string user, CertifiedSms smsIn)
        {


            return new UserSms()
            {
                User = user.ToUpperInvariant(),
                CertifiedSms = new List<CertifiedSms>() {
                        new CertifiedSms() {
                            Guid= smsIn.Guid,
                            ExternalId = smsIn.ExternalId,
                            App= smsIn.App.ToLowerInvariant(),
                            CreatedAt = smsIn.CreatedAt,
                            CertificationType = smsIn.CertificationType,
                            Certificates = smsIn.Certificates
                        }
                    }
            };
        }

        private UserSms GetNewUserSms(string user)
        {
            return new UserSms()
            {
                User = user.ToUpperInvariant(),
                CertifiedSms = new List<CertifiedSms>()
            };
        }
        private void OperateChanguesInUserSms(string user, CertifiedSms smsIn, Result<bool> result, UserSms userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            var filter = GetFilterUserSmsGuid(smsIn.Guid);
            var smsDb = userDb.CertifiedSms.Find(filter);


            if (smsDb == null)
            {
                userDb.CertifiedSms.Add(smsIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo un sms certificado idExterno: {smsIn.ExternalId} Guid: {smsIn.Guid} App: {smsIn.App}", "SG50");
            }
            else
            {
                UpdateSmsWithOther(smsIn, smsDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando el sms certificado {smsIn.ExternalId}-{smsDb.ExternalId}", "SG51");
            }
        }

        private static void UpdateSmsWithOther(CertifiedSms smsIn, CertifiedSms smsDb)
        {
            smsDb.ExternalId = smsIn.ExternalId;
            smsDb.Guid = smsIn.Guid;
            smsDb.App = smsIn.App;
        }
        #endregion
    }
}
