using Lefebvre.eLefebvreOnContainers.Services.Database.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Database.API.Infrastructure.Services
{
    public interface IDatabaseService
    {

        Task<Result<string>> GetSesionAsync(string idNavisionUser);

        Task<Result<DbDocSearch>> GetDocumentsAsync(string idNavisionUser,
                                                    string search,
                                                    string indice,
                                                    int start,
                                                    int max);

        Task<Result<DbDocCount>> GetDocumentsCountAsync(string idNavisionUser, string search);

        Task<Result<DbDocument>> GetDocumentByNrefAsync(string idNavisionUser, string producto, string nref);

        Task<Result<List<DbDocument>>> GetDbDocumentsAsync( string sesion,
                                                            string search,
                                                            string producto,
                                                            string orden,
                                                            string universal,
                                                            string tipoDoc);
    }
}