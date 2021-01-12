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
    using Microsoft.WindowsAzure.Storage;
    using System.Net.NetworkInformation;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;

    #endregion
    public class DocumentsRepository : BaseClass<DocumentsRepository>, IDocumentsRepository
    {
        private readonly SignatureContext _context;
        private readonly IOptions<SignatureSettings> _settings;

        #region ctors
        public DocumentsRepository(
                      IOptions<SignatureSettings> settings
                    //, IEventBus eventBus
                    , ILogger<DocumentsRepository> logger

                    ) : base(logger)
        {
            _settings = settings;
            _context = new SignatureContext(settings);//, eventBus);
        }
        #endregion

        #region Filters
        private static FilterDefinition<UserCertDocuments> GetFilterUser(string user)
        {
            return Builders<UserCertDocuments>.Filter.Eq(u => u.User, user.ToUpperInvariant());
        }

        private static FilterDefinition<UserCertDocuments> GetFilterDocument(string docId)
        {
            return Builders<UserCertDocuments>.Filter.ElemMatch(u => u.Documents, cert => cert.ExternalId == docId);
        }

        private static Predicate<CertDocument> GetFilterUserCertDoc(string guid)
        {
            return x => x.Guid.Equals(guid.ToUpperInvariant());
        }
        #endregion


        #region Actions
        public async Task<Result<UserCertDocuments>> GetUser(string user)
        {
            var result = new Result<UserCertDocuments>();
            var filter = GetFilterUser(user);
            try
            {
                result.data = await _context.Documents.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún documento certificado del usuario {user}"), "SG52");
                }
                else
                {
                    var documents = result.data?.Documents.ToList();

                    result.data.Documents = documents;
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {user}: {ex.Message}", "SG53");
            }
            return result;
        }

        public async Task<Result<List<UserCertDocuments>>> GetAll()
        {
            var result = new Result<List<UserCertDocuments>>();

            try
            {
                result.data = await _context.Documents.Find(f => true).ToListAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra información"), "SG54");
                }
                else
                {
                    var info = result.data?.ToList();
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos: {ex.Message}", "SG55"); ;
            }

            return result;
        }

        public async Task<Result<UserCertDocuments>> Create(UserCertDocuments userDocument)
        {
            var result = new Result<UserCertDocuments>();
            var filter = GetFilterUser(userDocument.User);

            try
            {
                var resultReplace = await _context.Documents.ReplaceOneAsync(filter, userDocument, GetUpsertOptions());

                var id = ManageCreateMessage(
                    $"User don't inserted {userDocument.User}",
                    $"User already existed and it's been modified {userDocument.User}",
                    $"User inserted {userDocument.User}",
                    result.infos, result.errors, resultReplace, "SG56");

                result.data = userDocument;

            }
            catch (Exception)
            {
                TraceInfo(result.infos, $"Error al guardar el documento {userDocument.User}", "SG57");
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
                var resultRemove = await _context.Documents.DeleteOneAsync(filter);
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {user}", "SG58");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG59");
            }
            return result;
        }

        public async Task<Result<UserCertDocuments>> UpSertDocument(string user, CertDocument documentIn)
        {
            var result = new Result<UserCertDocuments>();
            var filter = GetFilterUser(user);
            UserCertDocuments userDb = null;

            try
            {
                var userEmail = GetNewUserDocument(user, documentIn);

                userDb = await _context.Documents.Find(GetFilterUser(user)).SingleOrDefaultAsync();
                if (userDb == null)
                {
                    userDb = userEmail;
                    TraceInfo(result.infos, $"Se inserta el usuario {user}", "SG59");
                }
                else
                {
                    OperateChanguesInUserCertDocuments(user, documentIn, result, userDb);
                }
                var resultReplace = await _context.Documents.ReplaceOneAsync(filter, userDb, GetUpsertOptions());
            }
            catch (Exception ex)
            {
                TraceError(result.errors, ex, "SG60");
            }

            result.data = userDb;
            return result;
        }

        public async Task<Result<UserCertDocuments>> GetDocument(string documentId)
        {
            var result = new Result<UserCertDocuments>();
            var filter = GetFilterDocument(documentId);
            
            try
            {
                result.data = await _context.Documents.Find(filter).FirstOrDefaultAsync();

                if (result.data == null)
                {
                    TraceError(result.errors, new Exception($"No se encuentra ningún documento certificado para el id {documentId}"), "SG61");
                }
            }
            catch (Exception ex)
            {
                TraceInfo(result.infos, $"Error al obtener datos de {documentId}: {ex.Message} - {ex.StackTrace}", "SG62");
            }
            return result;
        }
        #endregion

        #region Helpers
        private UserCertDocuments GetNewUserDocument(string user, CertDocument documentIn)
        {
            return new UserCertDocuments()
            {
                User = user.ToUpperInvariant(),
                Documents = new List<CertDocument>() {
                        new CertDocument() {
                            Guid= documentIn.Guid,
                            ExternalId = documentIn.ExternalId,
                            Crc = documentIn.Crc,
                            CreatedAt = documentIn.CreatedAt,
                            Email = documentIn.Email,
                            Name = documentIn.Name,
                            Size = documentIn.Size,
                            App= documentIn.App.ToLowerInvariant()
                        }
                    }
             };
        }

        private UserCertDocuments GetNewUserCertDocuments(string user)
        {
            return new UserCertDocuments()
            {
                User = user.ToUpperInvariant(),
                Documents = new List<CertDocument>()
            };
        }
        private void OperateChanguesInUserCertDocuments(string user, CertDocument documentIn, Result<UserCertDocuments> result, UserCertDocuments userDb)
        {
            //userDb.signatures.ForEach(x => x.defaultAccount = false);
            //var signatureDb = userDb.signatures.Find(GetFilterUserSignature(signatureIn.externalId, signatureIn.guid));
            var filter = GetFilterUserCertDoc(documentIn.Guid);
            var documentDb = userDb.Documents.Find(filter);


            if (documentDb == null)
            {
                userDb.Documents.Add(documentIn);
                TraceInfo(result.infos, $"Se modifica el usuario {user} añadiendo un documento certificado idExterno: {documentIn.ExternalId} Guid: {documentIn.Guid} App: {documentIn.App}", "SG63");
            }
            else
            {
                UpdateDocumentWithOther(documentIn, documentDb);
                TraceInfo(result.infos, $"Se modifica el usuario {user} modificando el documento certificado {documentIn.ExternalId}-{documentDb.ExternalId}", "SG64");
            }
        }

        private static void UpdateDocumentWithOther(CertDocument documentIn, CertDocument documentDb)
        {
            documentDb.Guid = documentIn.Guid;
            documentDb.ExternalId = documentIn.ExternalId;
            documentDb.Crc = documentIn.Crc;
            documentDb.CreatedAt = documentIn.CreatedAt;
            documentDb.Email = documentIn.Email;
            documentDb.Name = documentIn.Name;
            documentDb.Size = documentIn.Size;
            documentDb.App = documentIn.App;
        }
        #endregion

    }
}