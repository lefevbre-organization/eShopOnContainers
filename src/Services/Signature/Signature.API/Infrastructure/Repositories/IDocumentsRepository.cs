namespace Signature.API.Infrastructure.Repositories
{
    #region using
    using Signature.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using MongoDB.Bson;
    #endregion

    public interface IDocumentsRepository
    {
        Task<Result<UserCertDocuments>> GetUser(string user);

        Task<Result<List<UserCertDocuments>>> GetAll();

        Task<Result<UserCertDocuments>> Create(UserCertDocuments document);

        Task<Result<bool>> Remove(string user);

        Task<Result<bool>> UpSertDocument(string user, CertDocument documentIn);

        Task<Result<UserCertDocuments>> GetDocument(string documentId);
    }
}