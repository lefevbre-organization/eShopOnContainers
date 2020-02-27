using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {
        Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser);

        Task<Result<LexonUser>> GetUserAsync(string idUser);

        Task<Result<List<LexonCompany>>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser);

       // Task<Result<long>> SelectCompanyAsync(string idUser, string bbdd);

        Task<MySqlList<JosEntityList, LexonEntityBase>> GetEntitiesListAsync(EntitySearchView entitySearch);

        Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch);

        Task<Result<LexonEntityBase>> GetEntityById(EntitySearchById entitySearch);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        Task<Result<long>> AddClassificationToListAsync(ClassificationAddView classification);
        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove);

        Task<Result<List<LexonActuation>>> GetClassificationsFromMailOldAsync(ClassificationSearchView classificationSearch);
        Task<MySqlCompany> GetClassificationsFromMailAsync(ClassificationSearchView classificationSearch);
    }
}