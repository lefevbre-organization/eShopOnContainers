using Centinela.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Centinela.Infrastructure.Services
{
    public interface ICentinelaService
    {
        Task<Result<CenUser>> GetEvaluationsAsync(string idNavisionUser);

        Task<Result<List<CenUser>>> GetEvaluationTreeAsync(string idNavisionUser, string idEvaluation);

        Task<MySqlCompany> GetConceptAsync(string idNavisionUser, string idConcept);

        Task<MySqlCompany> GetDocumentsAsync(string idNavisionUser, string search);

        Task<Result<bool>> FilePostAsync(string idNavisionUser, string idConcept);

        Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile);
    }
}