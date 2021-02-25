using Lefebvre.eLefebvreOnContainers.BuidingBlocks.Lefebvre.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Repositories
{
    using Models;
    public interface IUsersRepository
    {  
        Task<Result<LexUser>> GetUserAsync(string idUser);

        Task<Result<List<LexCompany>>> GetCompaniesListAsync(string idUser);

        Task<Result<List<LexActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail);

        Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView search);
        Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView search);

         Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync();

        Task<Result<long>> AddClassificationToListAsync(ClassificationAddView classificationAdd);

        Task<Result<long>> RemoveClassificationFromListAsync(ClassificationRemoveView classificationRemove);

        Task<Result<bool>> UpsertEntitiesAsync(IEntitySearchView search, MySqlCompany resultMySql);
        Task<Result<bool>> UpsertRelationsAsync(ClassificationSearchView classificationSearch, MySqlCompany resultMySql);
        Task<Result<bool>> UpsertUserAsync(Result<LexUser> result);
        Task<Result<bool>> UpsertCompaniesAsync(Result<List<LexCompany>> lexUser, string idUser);
    }
}