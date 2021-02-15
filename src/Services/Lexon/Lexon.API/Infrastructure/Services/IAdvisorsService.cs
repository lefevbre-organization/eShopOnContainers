using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
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