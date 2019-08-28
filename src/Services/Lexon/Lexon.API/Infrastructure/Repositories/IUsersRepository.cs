using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.API.Infrastructure.Repositories
{
    public interface IUsersRepository
    {
        Task<LexonUser> GetAsync(int idUser);

        Task<List<LexonCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser);

        Task<List<LexonClassification>> GetClassificationListAsync(int pageSize, int pageIndex, string idUser);

        Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser);

        Task<long> AddClassificationToListAsync(string idUser, string idMail, long idRelated, string type = "File");

        Task<long> AddFileToListAsync(string idUser, long idFile, string nameFile, string descriptionFile = "");

        Task<List<LexonUser>> GetListAsync(int pageSize, int pageIndex, string idUser);
    }
}