using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{

    public class UsersService : IUsersService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;

        public UsersService(
                    IUsersRepository usersRepository
                    , IEventBus eventBus
            )
        {
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        }


        public async Task<long> AddClassificationToListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            return await _usersRepository.AddClassificationToListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);
        }


        public async Task<long> AddFileToListAsync(string idUser, long idCompany, long idFile, string nameFile, string descriptionFile = "")
        {
            return await _usersRepository.AddFileToListAsync(idUser, idCompany, idFile, nameFile, descriptionFile);
        }

        public async Task<LexonActuationMailList> GetClassificationsFromMailAsync(int pageSize, int pageIndex, string idUser, long idCompany, string idMail)
        {
            return await _usersRepository.GetClassificationsFromMailAsync(pageSize, pageIndex, idUser, idCompany, idMail);
        }

        public async Task<List<LexonEntity>> GetClassificationMasterListAsync()
        {
            return await _usersRepository.GetClassificationMasterListAsync();
        }

        public async Task<List<LexonCompany>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser, long idCompany, string search)
        {
            return await _usersRepository.GetFileListAsync(pageSize, pageIndex, idUser, idCompany, search);
        }

        public async Task<List<LexonUser>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        }


        public async Task<LexonUser> GetUserAsync(string idUser)
        {
            return await _usersRepository.GetAsync(idUser);
        }

        public async Task<long> RemoveClassificationFromListAsync(string idUser, long idCompany, string idMail, long idRelated, short idClassificationType = 1)
        {
            return await _usersRepository.RemoveClassificationFromListAsync(idUser, idCompany, idMail, idRelated, idClassificationType);
        }

        public async Task<LexonCompany> SelectCompanyAsync(string idUser, long idCompany)
        {
            return await _usersRepository.SelectCompanyAsync(idUser, idCompany);
        }


    }
}