using Lexon.MySql.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {

        Task<List<JosCompany>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser);
    }
}
