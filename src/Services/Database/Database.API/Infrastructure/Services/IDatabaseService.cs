using Lefebvre.eLefebvreOnContainers.Services.Database.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Services
{
    public interface IDatabaseService
    {

        Task<Result<string>> GetSesionAsync(string idNavisionUser);

        Task<Result<List<Document>>> GetDocumentsAsync(string sesion, string search, string indice, int start, int max);

        Task<Result<DocumentsCount>> GetDocumentsCountAsync(string sesion, string search);

        Task<Result<Document>> GetDocumentByNrefAsync(string sesion, string producto, string nref);

        Task<Result<List<Document>>> GetDbDocumentsAsync(string sesion, string search, string producto, string orden, string universal, string tipoDoc);
    }
}