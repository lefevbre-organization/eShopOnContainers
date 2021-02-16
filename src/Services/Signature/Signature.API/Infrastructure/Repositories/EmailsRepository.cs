namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    #region using
    using Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson;
    using MongoDB.Bson.Serialization;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Newtonsoft.Json;
 
    #endregion

    public class EmailsRepository : BaseClass<EmailsRepository>, IEmailsRepository
    {
        private readonly SignatureContext _context;
        private readonly IOptions<SignatureSettings> _settings;

        #region ctors
        public EmailsRepository(
                      IOptions<SignatureSettings> settings
                    //, IEventBus eventBus
                    , ILogger<EmailsRepository> logger

                    ) : base(logger)
        {
            _settings = settings;
            _context = new SignatureContext(settings);//, eventBus);
        }
        #endregion

        #region Filters
        private static FilterDefinition<UserEmails> GetFilterUser(string user)
        {
            return Builders<UserEmails>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        }

        private static Predicate<UserBranding> GetFilterUserBranding(string app)
        {
            return x => x.app.Equals(app.ToLowerInvariant());
        }

        private static FilterDefinition<CertifiedEmail> GetFilterCertificate(string certificateId)
        {
            return Builders<CertifiedEmail>.Filter.ElemMatch(c => c.Certificates, cert => cert.ExternalId == certificateId);
        }

        private static FilterDefinition<UserEmails> GetFilterEmail(string certificateId)
        {
            return Builders<UserEmails>.Filter.ElemMatch(u => u.CertifiedEmails, GetFilterCertificate(certificateId));
        }

        private static FilterDefinition<EmailEventInfo> GetFilterEvents(string certificateId)
        {
            return Builders<EmailEventInfo>.Filter.Eq(u => u.Certificate.CertificateId, certificateId);
        }

        private static Predicate<CertifiedEmail> GetFilterUserEmailGuid(string guid)
        {
            return x => x.Guid.Equals(guid.ToUpperInvariant());
        }
        #endregion

        #region Projects
        private static ProjectionDefinition<UserEmails> GetProjectEmail(string certificateId)
        {
            return Builders<UserEmails>.Projection.Include(u => u.User).ElemMatch(u => u.CertifiedEmails, GetFilterCertificate(certificateId)).Exclude(u => u.Id);
        }
        #endregion

        #region Actions
        public async Task<Result<UserEmails>> GetUser(string user)
        {
            var result = new Result<UserEmails>();
            var filter = GetFilterUser(user);
            try
            {
                result.data = await _context.Emails.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún email certificado del usuario {user}"), "SG10");
                }
                else
                {
                    var signatures = result.data?.CertifiedEmails.ToList();

                    result.data.CertifiedEmails = signatures;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {user}: {ex.Message}", "SG10");
            }
            return result;
        }

        public async Task<Result<List<UserEmails>>> GetAll()
        {
            var result = new Result<List<UserEmails>>();

            try
            {
                result.data = await _context.Emails.Find(f => true).ToListAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra información"), "SG11");
                }
                else
                {
                    var info = result.data?.ToList();
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos: {ex.Message}", "SG11"); ;
            }

            return result;
        }

        public async Task<Result<UserEmails>> Create(UserEmails userEmail)
        {
            var result = new Result<UserEmails>();
            var filter = GetFilterUser(userEmail.User);

            try
            {
                var resultReplace = await _context.Emails.ReplaceOneAsync(filter, userEmail, GetUpsertOptions());

                var id = ManageCreateMessage(
                    $"User don't inserted {userEmail.User}",
                    $"User already existed and it's been modified {userEmail.User}",
                    $"User inserted {userEmail.User}",
                    result.infos, result.errors, resultReplace, "SG03");

                result.data = userEmail;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar la firma {userEmail.User}", "SG03");
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
                var resultRemove = await _context.Emails.DeleteOneAsync(filter);
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {user}", "SG12");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG12");
            }
            return result;
        }

        public async Task<Result<bool>> UpSertEmail(string user, CertifiedEmail emailIn)
        {
            var result = new Result<bool>();
            var filter = GetFilterUser(user);

            try
            {
                var userEmail = GetNewUserEmail(user, emailIn);

                var userDb = await _context.Emails.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userEmail;
                    TraceInfo(result.infos, $"Se inserta el usuario {userEmail.User}", "SG13");
                }
                else
                {
                    OperateChanguesInUserEmails(user, emailIn, result, userDb);
                }
                var resultReplace = await _context.Emails.ReplaceOneAsync(filter, userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG13");
            }

            result.data = true;
            return result;
        }

        public async Task<Result<bool>> UpSertBranding(string user, UserBranding brandingIn)
        {
            var result = new Result<bool>();
            var filter = GetFilterUser(user);

            try
            {
                var userSignature = GetNewUserEmail(user);

                var userDb = await _context.Emails.Find(filter).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userSignature;
                    TraceInfo(result.infos, $"Se inserta el branding {brandingIn.app} con id {brandingIn.externalId} para el usuario {user}", "SG14");
                }
                else
                {
                    OperateChanguesInUserBrandings(user, brandingIn, result, userDb);
                }
                var resultReplace = await _context.Emails.ReplaceOneAsync(filter, userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG14");
            }

            result.data = true;
            return result;
        }

        public async Task<Result<UserEmails>> GetEmail(string certificateId)
        {
            var result = new Result<UserEmails>();
            var filter = GetFilterEmail(certificateId);
            var project = GetProjectEmail(certificateId);

            try
            {
                result.data = BsonSerializer.Deserialize<UserEmails>(await _context.Emails.Find(filter).Project(project).FirstOrDefaultAsync());

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún email certificado para el id {certificateId}"), "SG15");
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {certificateId}: {ex.Message} - {ex.StackTrace}", "SG15");
            }
            return result;
        }

        public async Task<Result<bool>> ResetUserBrandings(string user)
        {
            var result = new Result<bool>();
            UpdateResult resultUpdate;
            Dictionary<string, string> values = new Dictionary<string, string>();
            var code = 0;

            try
            {

                if (user == "all")
                {
                    resultUpdate = await _context.Emails.UpdateManyAsync(
                        f => true,
                        Builders<UserEmails>.Update.Set("Brandings", new BsonArray()));
                }
                else
                {
                    resultUpdate = await _context.Emails.UpdateManyAsync(
                        u => u.User == user,
                        Builders<UserEmails>.Update.Set("Brandings", new BsonArray())
                    );
                };

                if (resultUpdate.IsAcknowledged)
                {
                    values.Add("IsAcknowledged", resultUpdate.IsAcknowledged.ToString());
                    values.Add("IsModifiedCountAvailable", resultUpdate.IsModifiedCountAvailable.ToString());
                    values.Add("MatchedCount", resultUpdate.MatchedCount.ToString());
                    values.Add("ModifiedCount", resultUpdate.ModifiedCount.ToString());
                }
                else
                {
                    values.Add("Error:", "Error al ejecutar en mongo");
                    code = 100;
                }

                var outputJson = JsonConvert.SerializeObject(values);
                //Info info = new Info() { code = code.ToString(), message = outputJson };
                //List<Info> infos = new List<Info>() { new Info() { code = code.ToString(), message = outputJson } } ;
                //infos.Add(info);
                result.data = true;
                result.infos = new List<Info>() { new Info() { code = code.ToString(), message = outputJson } }; ;

                Console.WriteLine(result);


            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG16");
            }
            return result;
        }

        #endregion

        #region Events
        public async Task<Result<bool>> SaveEvent(EmailEventInfo eventInfo)
        {
            var result = new Result<bool>();

            try
            {
                await _context.EmailEvents.InsertOneAsync(eventInfo);
                if (eventInfo.mongoId != null)
                {
                    result.data = true;
                    TraceInfo(result.infos, $"Evento recibido - {eventInfo.mongoId}", "SG32");
                }
                else
                {
                    result.data = false;
                    TraceInfo(result.infos, $"Evento no se ha podido almacenar - {eventInfo.mongoId}", "SG32");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new Exception($"No se ha podido guardar el evento - {eventInfo.mongoId} - {ex.Message}"), "SG32");
            }
            return result;
        }

        public async Task<Result<List<EmailEventInfo>>> GetEvents(string certificateId)
        {
            var result = new Result<List<EmailEventInfo>>();
            var result2 = new Result<EmailEventInfo>();
            var filter = GetFilterEvents(certificateId);

            try
            {
                if (certificateId == "all")
                {

                    //result.data = BsonSerializer.Deserialize<SignEventInfo>(await _context.SignatureEvents.Find(filter).FirstOrDefaultAsync());
                    result.data = await _context.EmailEvents.Find(f => true).ToListAsync();
                }
                else
                {
                    result.data = await _context.EmailEvents.Find(filter).ToListAsync();
                }


                if (result.data == null || result.data.Count == 0)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún evento para el email certificado {certificateId}"), "SG32");
                }
                else
                {
                    var events = result.data?.ToList();

                    result.data = events;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {certificateId}: {ex.Message}", "SG32");
            }
            return result;
        }
        #endregion

        #region Helpers

        private UserEmails GetNewUserEmail(string user, CertifiedEmail emailIn)
        {


            return new UserEmails()
            {
                User = user.ToUpperInvariant(),
                Brandings = new List<UserBranding>(),
                CertifiedEmails = new List<CertifiedEmail>() {
                        new CertifiedEmail() {
                            Guid= emailIn.Guid,
                            ExternalId = emailIn.ExternalId,
                            App= emailIn.App.ToLowerInvariant(),
                            CreatedAt = emailIn.CreatedAt,
                            CertificationType = emailIn.CertificationType,
                            Certificates = emailIn.Certificates
                        }
                    }
            };
        }

        private UserEmails GetNewUserEmail(string user)
        {
            return new UserEmails()
            {
                User = user.ToUpperInvariant(),
                Brandings = new List<UserBranding>(),
                CertifiedEmails = new List<CertifiedEmail>()
            };
        }
        private void OperateChanguesInUserEmails(string user, CertifiedEmail emailIn, Result<bool> result, UserEmails userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            var filter = GetFilterUserEmailGuid(emailIn.Guid);
            var emailDb = userDb.CertifiedEmails.Find(filter);


            if (emailDb == null)
            {
                userDb.CertifiedEmails.Add(emailIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo un email certificado idExterno: {emailIn.ExternalId} Guid: {emailIn.Guid} App: {emailIn.App}", "SG22");
            }
            else
            {
                UpdateEmailWithOther(emailIn, emailDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando el email certificado {emailIn.ExternalId}-{emailDb.ExternalId}", "SG22");
            }
        }

        private void OperateChanguesInUserBrandings(string user, UserBranding brandingIn, Result<bool> result, UserEmails userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));

            var brandingDb = userDb.Brandings.Find(GetFilterUserBranding(brandingIn.app));

            if (brandingDb == null)
            {
                userDb.Brandings.Add(brandingIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo un branding para {brandingIn.app}-{brandingIn.externalId}", "SG17");
            }
            else
            {
                UpdateBrandingWithOther(brandingIn, brandingDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando el branding para {brandingIn.app}-{brandingIn.externalId}", "SG17");
            }
        }

        private static void UpdateEmailWithOther(CertifiedEmail emailIn, CertifiedEmail emailDb)
        {
            emailDb.ExternalId = emailIn.ExternalId;
            emailDb.Guid = emailIn.Guid;
            emailDb.App = emailIn.App;
        }

        private static void UpdateBrandingWithOther(UserBranding brandingIn, UserBranding brandingDb)
        {
            brandingDb.app = brandingIn.app;
            brandingDb.externalId = brandingIn.externalId;
        }



        #endregion
    }
}
