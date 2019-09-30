﻿using Lexon.API.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public interface IUsersService
    {
        Task<List<LexonUser>> GetListUsersAsync(int pageSize, int pageIndex, string idUser);
        Task<LexonUser> GetUserAsync(string idUser);

        Task<List<LexonCompany>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser);

        Task<bool> SelectCompanyAsync(string idUser, long idCompany);

        Task<LexonActuationMailList> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail);

        Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser, long idCompany, string search);

        Task<List<LexonEntity>> GetClassificationMasterListAsync();

        Task<long> AddClassificationToListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1);
        Task<long> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1);

        Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "");

    }
}