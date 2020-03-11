using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<Result<LexUser>> GetCompaniesFromUserAsync(string idNavisionUser);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView entitySearch);

        Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<List<int>>> AddRelationMailAsync(ClassificationAddView classification);

        Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification);

        Task<Result<LexUser>> GetUserAsync(string idUser,
                                           string bbdd = null,
                                           string provider = null,
                                           string mailAccount = null,
                                           string uidMail = null,
                                           string folder = null,
                                           short? idEntityType = null,
                                           int? idEntity = null,
                                           List<string> mailContacts = null,
                                           string login = null,
                                           string password = null,
                                           bool addTerminatorToToken = true);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);

        Result<LexNestedEntity> GetNestedFolderAsync(FolderNestedView entityFolder);
    }
}