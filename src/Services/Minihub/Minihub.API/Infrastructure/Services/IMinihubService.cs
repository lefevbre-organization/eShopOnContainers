using Minihub.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Minihub.Infrastructure.Services
{
    public interface IMinihubService
    {
        Task<Result<MinihubUser>> GetMinihubAsync(string idNavisionUser);

        Task<Result<string>> GetEncodeUserAsync(string idNavisionUser);
        Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser);

        //Task<MySqlCompany> GetConceptAsync(string idNavisionUser, string idConcept);

        //Task<MySqlCompany> GetDocumentsAsync(string idNavisionUser, string search);

        //Task<Result<bool>> FilePostAsync(string idNavisionUser, string idConcept);

        //Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile);
    }
}