using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Signature.API.Infrastructure.Services
{
    using Model;
    using BuidingBlocks.Lefebvre.Models;

    public interface IDocumentsService
    {
        Task<Result<UserCertDocuments>> GetDocuments(string user);

        Task<Result<List<UserCertDocuments>>> GetAll();

        Task<Result<UserCertDocuments>> CreateDocument(UserCertDocuments document);

        Task<Result<bool>> Remove(string user);

        Task<Result<UserCertDocuments>> UpSertDocument(string user, CertDocument certDocumentIn);
    }
}