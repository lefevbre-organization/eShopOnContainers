namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Repositories
{
    #region using
    using Model;
    using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    #endregion

    public interface IDocumentsRepository
    {
        Task<Result<UserCertDocuments>> GetUser(string user);

        Task<Result<List<UserCertDocuments>>> GetAll();

        Task<Result<UserCertDocuments>> Create(UserCertDocuments document);

        Task<Result<bool>> Remove(string user);

        Task<Result<UserCertDocuments>> UpSertDocument(string user, CertDocument documentIn);

        Task<Result<UserCertDocuments>> GetDocument(string documentId);
    }
}