using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Signature.API.Infrastructure.Services
{
    #region Using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System;
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