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

        Task<Result<long>> SelectCompanyAsync(string idUser, string bbdd);

        Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, string bbdd, string idMail, short? idType);

        Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, short? idType, string idUser, string bbdd, string searchFilter, long? idFilter);

        Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync();

     //   Task<Result<long>> AddClassificationToListAsync(string idUser, string bbdd, string[] listaMails, long idRelated, short? idType = 1);
        Task<Result<long>> AddClassificationToListAsync(string idUser, string bbdd, MailInfo[] listaMails, long idRelated, short? idType = 1);

        Task<Result<long>> RemoveClassificationFromListAsync(string idUser, string provider, string mailAccount, string uidMail, string bbdd, long idRelated, short? idType = 1);

        //Task<Result<long>> AddFileToListAsync(string idUser, string bbdd, long idFile, string nameFile, string descriptionFile = "");
    }
}