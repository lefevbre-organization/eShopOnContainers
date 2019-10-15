using Lexon.MySql.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {

        Task<JosUserCompanies> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser);
        Task<JosEntitiesList>  GetMasterEntitiesAsync();
        Task<JosFilesList> GetEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search);
    }
}
