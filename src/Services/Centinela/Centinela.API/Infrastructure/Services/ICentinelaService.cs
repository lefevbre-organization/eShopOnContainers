using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Infrastructure.Services
{
    public interface ICentinelaService
    {
        Task<Result<CenUser>> GetUserAsync(string idNavisionUser);

        Task<Result<List<CenEvaluation>>> GetEvaluationsAsync(string idNavisionUser);

        Task<Result<CenEvaluation>> GetEvaluationByIdAsync(string idNavisionUser, int idEvaluation);

        Task<Result<List<CenDocument>>> GetDocumentsAsync(string idNavisionUser, string search);
        Task<Result<List<CenDocumentObject>>> GetDocumentsByInstanceAsync(string idNavisionUser, string conceptObjectId);

        Task<Result<bool>> FilePostAsync(ConceptFile file);

        Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile);

        Task<Result<List<CenEvaluationTree>>> GetEvaluationTreeByIdAsync(string idNavisionUser, int idEvaluation);

        Task<Result<List<CenConceptInstance>>> GetConceptsByTypeAsync(string idNavisionUser, int idConcept);
    }
}