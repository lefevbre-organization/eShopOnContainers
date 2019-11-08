using Lexon.MySql.Model;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<Result<JosUserCompanies>> GetCompaniesListAsync(int pageSize, int pageIndex, string idNavisionUser);
        Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync();

        Task<Result<JosEntityList>> SearchEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search, long idFilter);
        Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated);
        Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, string[] listaMails, long idRelated);
    }
}