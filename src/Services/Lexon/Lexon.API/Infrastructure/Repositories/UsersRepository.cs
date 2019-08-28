using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.API.Infrastructure.Repositories
{

    public class UsersRepository : IUsersRepository
    {
        public Task<long> AddClassificationToListAsync(string idUser, string idMail, long idRelated, string type = "File")
        {
            throw new System.NotImplementedException();
        }

        public Task<long> AddFileToListAsync(string idUser, long idFile, string nameFile, string descriptionFile = "")
        {
            throw new System.NotImplementedException();
        }

        public Task<LexonUser> GetAsync(int idUser)
        {
            throw new System.NotImplementedException();
        }

        public Task<List<LexonClassification>> GetClassificationListAsync(int pageSize, int pageIndex, string idUser)
        {
            throw new System.NotImplementedException();
        }

        public Task<List<LexonCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            throw new System.NotImplementedException();
        }

        public Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser)
        {
            throw new System.NotImplementedException();
        }

        public Task<List<LexonUser>> GetListAsync(int pageSize, int pageIndex, string idUser)
        {
            throw new System.NotImplementedException();
        }
    }
}