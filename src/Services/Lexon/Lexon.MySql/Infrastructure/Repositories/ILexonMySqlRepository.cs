using Lexon.MySql.Model;
using System.Threading.Tasks;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<Result<JosUserCompanies>> GetCompaniesListAsync(int pageSize,
                                                             int pageIndex,
                                                             string idUser);
        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        Task<MySqlList<JosEntityList, JosEntity>> SearchEntitiesAsync(EntitySearchView entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification);

        Task<Result<JosUser>> GetUserAsync(string idNavisionUser);

        Task<Result<JosRelationsList>> SearchRelationsAsync(ClassificationSearchView classification);
        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);
        Task<Result<JosEntity>> GetEntityAsync(EntitySearchById entitySearch);
    }
}