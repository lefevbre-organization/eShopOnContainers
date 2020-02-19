using Lexon.MySql.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<Result<JosUserCompanies>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idNavisionUser);

        Task<MySqlList<JosEntityTypeList>> GetMasterEntitiesAsync();

        Task<Result<JosEntityList>> GetEntitiesAsync(EntitySearchView entitySearch);

        Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification);

        Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification);

        Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification);

        Task<Result<JosRelationsList>> GetRelationsAsync(ClassificationSearchView classification);

        Task<Result<JosUser>> GetUserAsync(string idUser,
                                           string bbdd = null,
                                           string provider = null,
                                           string mailAccount = null,
                                           string uidMail = null,
                                           string folder = null,
                                           short? idEntityType = null,
                                           int? idEntity = null,
                                           List<string> mailContacts = null,
                                           bool addTerminatorToToken = true);

        Task<Result<JosEntity>> GetEntityAsync(EntitySearchById entitySearch);
      
    }
}