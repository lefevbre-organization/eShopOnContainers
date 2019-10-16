using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.API.Infrastructure.Repositories
{
    public interface IUsersRepository
    {
        Task<List<LexonUser>> GetListAsync(int pageSize, int pageIndex, string idUser);
        Task<LexonUser> GetAsync(string idUser);

        Task<List<LexonCompany>> GetCompaniesListAsync(string idUser);

        Task<List<LexonActuation>> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail);

        Task<List<LexonEntityBase>> GetEntitiesListAsync(int pageSize, int pageIndex, int idType, string idUser, long idCompany, string search);
        
        Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "");

        Task<List<LexonEntityType>> GetClassificationMasterListAsync();
        Task<long> AddClassificationToListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1);
        Task<long> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType);
        Task<bool> SelectCompanyAsync(string idUser, long idCompany);

    }
}