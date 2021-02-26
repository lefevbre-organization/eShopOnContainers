using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services
{
    using BuidingBlocks.Lefebvre.Models;
    using ViewModel;
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