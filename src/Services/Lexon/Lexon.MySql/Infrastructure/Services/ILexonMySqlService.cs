using Lexon.MySql.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<Result<LexUser>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idNavisionUser);

        Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync();

        //Task<MySqlList<JosEntityList, JosEntity>> GetEntitiesAsync(EntitySearchView entitySearch);

        Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch);
        Task<Result<JosEntity>> GetEntityAsync(EntitySearchById entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification);

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
                                           bool addTerminatorToToken = true);

        Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder);
    }
}