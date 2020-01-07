using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lefebvre.eLefebvreOnContainers.Models;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Repositories
{
    public interface IUsersRepository
    {
        Task<Result<List<LexonUser>>> GetListAsync(int pageSize, int pageIndex, string idUser);

        Task<Result<LexonUser>> GetAsync(string idUser);

        Task<Result<List<LexonCompany>>> GetCompaniesListAsync(string idUser);

        Task<Result<List<LexonActuation>>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail);

        Task<Result<List<LexonEntityBase>>> GetEntitiesListAsync(int pageSize, int pageIndex, int idType, string idUser, long idCompany, string search);

        Task<Result<long>> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "");

        Task<Result<List<LexonEntityType>>> GetClassificationMasterListAsync();

        Task<Result<long>> AddClassificationToListAsync(string idUser, long idCompany, string[] listaMails, long idRelated, short idClassificationType = 1);

        Task<Result<long>> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType);

        Task<Result<long>> SelectCompanyAsync(string idUser, long idCompany);
    }
}