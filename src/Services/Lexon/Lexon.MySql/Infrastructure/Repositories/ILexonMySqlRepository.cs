using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<Result<JosUserCompanies>> GetCompaniesListAsync(int pageSize,
                                                             int pageIndex,
                                                             string idUser);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

      //  Task<MySqlList<JosEntityList, JosEntity>> SearchEntitiesAsync(EntitySearchView entitySearch);

        Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch);


        Task<Result<JosEntity>> GetEntityAsync(EntitySearchById entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification);

        Task<Result<JosUser>> GetUserAsync(string idNavisionUser);

        Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification);
        //Task<Result<JosRelationsList>> SearchRelationsAsync(ClassificationSearchView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);
    }
}