using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {
        Task<List<LexonUser>> GetListUsersAsync(int pageSize, int pageIndex, string idUser);

        Task<List<LexonCompany>> GetCompaniesbyUserAsync(int pageSize, int pageIndex, string idUser);

        Task<List<LexonClassification>> GetClassificationListAsync(int pageSize, int pageIndex, string idUser);

        Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser);

        Task<long> AddClassificationToListAsync(string idUser, string idMail, long idRelated, string type = "File");

        Task<long> AddFileToListAsync(string idUser, long idFile, string nameFile, string descriptionFile = "");

        Task<LexonUser> GetUserAsync(int idUser);
    }
}