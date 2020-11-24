using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
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