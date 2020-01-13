using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.API.Infrastructure.Repositories
{
    public interface IUsersRepository
    {
        Task<Result<List<LexonUser>>> GetListAsync(int pageSize, int pageIndex, string idUser);
        Task<Result<LexonUser>> GetAsync(string idUser);

        Task<Result<List<LexonCompany>>> GetCompaniesListAsync(string idUser);

        Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail);

        Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, short? idType, string idUser, string bbdd, string search);
        
        Task<Result<long>> AddFileToListAsync(string idUser, string bbdd, long idFile, string nameFile, string descriptionFile = "");

        Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync();

        Task<Result<long>> AddClassificationToListAsync(string idUser, string bbdd, string[] listaMails, long idRelated, short? idClassificationType = 1);

        Task<Result<long>> RemoveClassificationFromListAsync(string idUser, string bbdd, string idMail, long idRelated, short? idClassificationType);

        Task<Result<long>> SelectCompanyAsync(string idUser, string bbdd);
    }
}