using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    public interface IContactsService
    {
        Task<Result<int>> AddRelationContactsMailAsync(string env,
                                               string idUser,
                                               string bbdd,
                                               ContactsView classification);

        Task<Result<LexContact>> GetContactAsync(string env,
                                                 string idUser,
                                                 string bbdd,
                                                 short idType,
                                                 long idContact);
        Task<Result<PaginatedItemsViewModel<LexContact>>> GetAllContactsAsync(string env,
                                                                               string idUser,
                                                                               string bbdd,
                                                                               string email,
                                                                               int pageIndex,
                                                                               int pageSize);
    }
}