﻿using Lexon.MySql.Model;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public interface ILexonMySqlRepository
    {
        Task<JosUserCompanies> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser);
        Task<JosEntityTypeList> GetMasterEntitiesAsync();

        Task<JosEntityList> SearchEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search);
        Task<int> AddRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated);
    }
}