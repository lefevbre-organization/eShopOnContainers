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

        public async Task<JosUserCompanies> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _lexonRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<JosEntitiesList> GetMasterEntities()
        {
            return await _lexonRepository.GetMasterEntities();
        }
    }
}