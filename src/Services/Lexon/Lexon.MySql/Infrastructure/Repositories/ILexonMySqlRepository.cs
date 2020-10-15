using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<Result<LexUser>> GetCompaniesListAsync(string idUser);

        Task<MySqlList<LexEntityTypeList, LexEntityType>> GetMasterEntitiesAsync();

        Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView entitySearch);

        Task<MySqlCompany> GetFoldersFilesEntitiesAsync(IEntitySearchView entitySearch);

        Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch);

        Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch);

        Task<Result<List<LexContact>>> GetAllContactsAsync(BaseView search);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<List<int>>> AddRelationMailAsync(ClassificationAddView classification);

        Task<Result<LexUser>> GetUserAsync(string idNavisionUser);

        Task<Result<LexUserSimple>> GetUserIdAsync(string idNavisionUser);

        Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);

        Task<Result<LexUserSimpleCheck>> CheckRelationsMailAsync(string idUser, MailInfo mail);
    }
}