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

        public async Task<long> AddClassificationToListAsync(string idUser, string idMail, long idRelated, string type = "File")
        {
            return await _usersRepository.AddClassificationToListAsync(idUser, idMail, idRelated, type);
        }

        public async Task<long> AddFileToListAsync(string idUser, long idFile, string nameFile, string descriptionFile = "")
        {
            return await _usersRepository.AddFileToListAsync(idUser, idFile, nameFile, descriptionFile);
        }

        public async Task<List<LexonClassification>> GetClassificationListAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetClassificationListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<List<LexonCompany>> GetCompaniesbyUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<List<LexonFile>> GetFileListAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetFileListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<List<LexonUser>> GetListUsersAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _usersRepository.GetListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<LexonUser> GetUserAsync(int idUser)
        {
            return await _usersRepository.GetAsync(idUser);
        }
    }
}