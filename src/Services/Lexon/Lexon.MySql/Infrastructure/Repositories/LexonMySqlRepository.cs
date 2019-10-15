using Lexon.MySql.Model;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public class LexonMySqlRepository : ILexonMySqlRepository
    {
        private readonly IOptions<LexonSettings> _settings;

        //"database=lexon_pre_shl_01;server=ES006-PPDDB003;port=3315;user id=led-app-conecta;password=DSlkjmfw+34d";
        //private string _conn = "database=lexon_pre_shl_02;server=ES006-PPDDB003;port=3315;user id=led-ext-freyes;password=DSFkds4+46DSF"; 
        private string _conn; 

        public LexonMySqlRepository(
               IOptions<LexonSettings> settings
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _conn = _settings.Value.ConnectionString; 
        }

        public async Task<JosUserCompanies> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var companies = new JosUserCompanies();

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = $"{{\"NavisionId\":\"{idUser}\"}}" });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                companies = JsonConvert.DeserializeObject<JosUserCompanies>(reader.GetValue(0).ToString());
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.Message);
                }
            }

            return companies;
        }

        public async Task<JosEntitiesList> GetMasterEntities()
        {
            var companies = new JosEntitiesList();

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                companies = JsonConvert.DeserializeObject<JosEntitiesList>(reader.GetValue(0).ToString());
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.Message);
                }
            }

            return companies;
        }
    }
}