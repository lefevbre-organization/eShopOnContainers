﻿using Lefebvre.eLefebvreOnContainers.Models;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.ViewModel;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services
{
    public class LexonMySqlService : ILexonMySqlService
    {
        public readonly ILexonMySqlRepository _lexonRepository;
        private readonly IOptions<LexonSettings> _settings;

        public LexonMySqlService(
            IOptions<LexonSettings> settings
            , ILexonMySqlRepository lexonRepository
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _lexonRepository = lexonRepository ?? throw new ArgumentNullException(nameof(lexonRepository));
        }

        public async Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, MailInfo[] listaMails, long idRelated)
        {
            return await _lexonRepository.AddRelationMailAsync(idType, bbdd, idUser, listaMails, idRelated);
        }

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated)
        {
            return await _lexonRepository.RemoveRelationMailAsync(idType, bbdd, idUser, idMail, idRelated);
        }

        public async Task<Result<JosUserCompanies>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _lexonRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<Result<JosEntityList>> GetEntitiesAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string search, long? idFilter)
        {
            return await _lexonRepository.SearchEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search, idFilter);
        }

        public async Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync()
        {
            return await _lexonRepository.GetMasterEntitiesAsync();
        }

        public async Task<Result<JosUser>> GetUserAsync(string idUser)
        {
            return await _lexonRepository.GetUserAsync(idUser);
        }

        public async Task<Result<JosRelationsList>> GetRelationsAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string idMail)
        {
            return await _lexonRepository.SearchRelationsAsync(pageSize, pageIndex, idType, bbdd, idUser, idMail);
        }
    }
}