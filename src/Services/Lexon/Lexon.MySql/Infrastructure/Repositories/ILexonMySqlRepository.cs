using Lexon.MySql.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<List<JosCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser);
    }

}
