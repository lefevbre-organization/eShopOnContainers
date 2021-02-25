namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    #region Using
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    #endregion Using

    public interface IDocumentsService
    {
        Task<Result<UserCertDocuments>> GetDocuments(string user);

        Task<Result<List<UserCertDocuments>>> GetAll();

        Task<Result<UserCertDocuments>> CreateDocument(UserCertDocuments document);

        Task<Result<bool>> Remove(string user);

        Task<Result<UserCertDocuments>> UpSertDocument(string user, CertDocument certDocumentIn);
    }
}