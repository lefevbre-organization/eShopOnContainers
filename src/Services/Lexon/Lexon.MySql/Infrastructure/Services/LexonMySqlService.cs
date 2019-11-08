using Lexon.MySql.Infrastructure.Repositories;
using Lexon.MySql.Model;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
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

        public async Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, string[] listaMails, long idRelated)
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

        public async Task<Result<JosEntityList>> GetEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search, long idFilter)
        {
            return await _lexonRepository.SearchEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search, idFilter);
        }

        public async Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync()
        {
            return await _lexonRepository.GetMasterEntitiesAsync();
        }
    }
}