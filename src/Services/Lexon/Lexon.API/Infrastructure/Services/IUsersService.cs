using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {
        Task<Result<List<LexonUser>>> GetListUsersAsync(int pageSize, int pageIndex, string idUser);
        Task<Result<LexonUser>> GetUserAsync(string idUser);

        Task<Result<List<LexonCompany>>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser);

        Task<Result<long>> SelectCompanyAsync(string idUser, long idCompany);

        Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail);

        Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, short idType, string idUser, long idCompany, string search, string search1, long idFilter);

        Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync();

        Task<Result<long>> AddClassificationToListAsync(string idUser, long idCompany, string bbdd, string[] listaMails, long idRelated, short idClassificationType = 1);
        Task<Result<long>> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, string idMail1, long idRelated, short idClassificationType = 1);

        Task<Result<long>> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "");

    }
}