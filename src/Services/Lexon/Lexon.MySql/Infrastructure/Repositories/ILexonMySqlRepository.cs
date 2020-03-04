using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<Result<LexUser>> GetCompaniesListAsync(string idUser);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView entitySearch);

        Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification);

        Task<Result<LexUser>> GetUserAsync(string idNavisionUser);

        Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);
        //Task<Result<LexNestedEntity>> GetNestedFolderAsync(FolderNestedView entityFolder);
    }
}