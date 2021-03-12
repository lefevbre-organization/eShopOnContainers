using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using ViewModel;
    public interface IAdvisorsService
    {
        Task<Result<PaginatedItemsViewModel<LexAdvisorFile>>> GetAdvisorsFilesAsync(string env,
                                                                                    string idUser,
                                                                                    string bbdd,
                                                                                    string email,
                                                                                    int pageIndex,
                                                                                    int pageSize);
        Task<Result<PaginatedItemsViewModel<LexContact>>> GetAdvisorsContact(string env,
                                                                             string idUser,
                                                                             string bbdd,
                                                                             string email,
                                                                             int pageIndex,
                                                                             int pageSize);

    }
}