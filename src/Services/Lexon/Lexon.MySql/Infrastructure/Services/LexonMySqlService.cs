using Lexon.MySql.Infrastructure.Repositories;
using Lexon.MySql.Model;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public class LexonMySqlService : ILexonMySqlService
    {
        public readonly ILexonMySqlRepository _lexonRepository;

        public LexonMySqlService(
            ILexonMySqlRepository lexonRepository
            )
        {
            _lexonRepository = lexonRepository ?? throw new ArgumentNullException(nameof(lexonRepository));

        }
        public async Task<JosUserCompanies> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _lexonRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);

        }
    }
}
