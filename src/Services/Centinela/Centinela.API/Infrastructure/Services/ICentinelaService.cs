using Lefebvre.eLefebvreOnContainers.Services.Centinela.API.Models;
using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
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

        Task<Result<bool>> FilePostAsync(ConceptFile file, string route = "");

        Task<Result<string>> FileGetAsync(string idNavisionUser, string idFile);

        Task<Result<List<CenEvaluationTree>>> GetEvaluationTreeByIdAsync(string idNavisionUser, int idEvaluation);

        Task<Result<List<CenConceptInstance>>> GetConceptsByTypeAsync(string idNavisionUser, int idConcept);
        Task<Result<List<CenContact>>> GetContactsAsync(string idNavisionUser);

        Task<Result<List<CenContact>>> GetSmsContactsAsync(string idNavisionUser);


        Task<Result<bool>> CancelSignatureAsync(string guid);

        Task<Result<bool>> NotifySignatureAsync(string service, string guid, string documentId, List<CenRecipient> recipients);

        Task<Result<bool>> CertificationPostAsync(CertificationFile file, string route = "");

    }
}