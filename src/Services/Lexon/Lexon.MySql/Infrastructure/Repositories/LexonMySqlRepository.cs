using Lexon.MySql.Model;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public class LexonMySqlRepository : ILexonMySqlRepository
    {
        //private readonly LexonMySqlContext _context;
        private string _conn = "database=lexon_pre_shl_01;server=ES006-PPDDB003;port=3315;user id=led-ext-freyes;password=DSFkds4+46DSF"; 
        //"database=lexon_pre_shl_01;server=ES006-PPDDB003;port=3315;user id=led-app-conecta;password=DSlkjmfw+34d";

        public LexonMySqlRepository(
            //LexonMySqlContext context
            )
        {
            //_context = context;
        }

        public async Task<JosUserCompanies> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var companies = new JosUserCompanies();

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand("PROC_CONN_COMPANIES_GET", conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = $"{{\"NavisionId\":\"{idUser}\"}}" });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = command.ExecuteReader())
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
    }
}