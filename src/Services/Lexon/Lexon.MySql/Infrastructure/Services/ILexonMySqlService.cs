using Lexon.MySql.Model;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<JosUserCompanies> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idNavisionUser);

        Task<JosEntityTypeList> GetMasterEntitiesAsync();

        Task<JosEntityList> GetEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search);
        Task<int> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated);
        Task<int> AddRelationMailAsync(short idType, string bbdd, string idUser, string[] listaMails, long idRelated);
    }
}