using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Model;

//using Lexon.MySql.Model;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services
{
    public interface ILexonMySqlService
    {
        Task<Result<JosUserCompanies>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idNavisionUser);

        Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync();

        Task<Result<JosEntityList>> GetEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search, long idFilter);

        Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated);

        Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, string[] listaMails, long idRelated);

        Task<Result<JosUser>> GetUserAsync(string idUser);

        Task<Result<JosRelationsList>> GetRelationsAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string idMail);
    }
}