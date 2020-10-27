using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
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
        Task<Result<List<LexContact>>> GetAllContactsAsync(string env,
                                                           string idUser,
                                                           string bbdd,
                                                           int pageIndex,
                                                           int pageSize);
    }
}