using Lexon.MySql.Model;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public class LexonMySqlRepository : ILexonMySqlRepository
    {
        //private readonly LexonMySqlContext _context;

        public LexonMySqlRepository(
            //LexonMySqlContext context
            )
        {
            //_context = context;
        }

        public async Task<List<JosCompany>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var myConnectionString = "database=lexon_pre_shl_01;server=ES006-PPDDB003;port=3315;user id=led-app-conecta;password=DSlkjmfw+34d";
             myConnectionString = "database=lexon_pre_shl_01;server=ES006-PPDDB003;port=3315;user id=led-ext-freyes;password=DSFkds4+46DSF";
                var companies = new List<JosCompany>();

            using (MySqlConnection conn = new MySqlConnection(myConnectionString))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand())
                    {
                        var inParam = new MySqlParameter()
                        {
                            ParameterName = "P_USER",
                            DbType = DbType.String,
                            Direction = ParameterDirection.Input
                        };
                        command.Parameters.Add(inParam);

                        command.CommandType = CommandType.StoredProcedure;
                        command.CommandText = "PROC_CONN_COMPANIES_GET";
                        command.Connection = conn;
                        MySqlDataReader reader = command.ExecuteReader();
                        while (reader.Read())
                        {
                            long.TryParse(reader[0].ToString(), out long idCompany);
                            var company = new JosCompany
                            {
                                IdCompany = idCompany,
                                Name = reader[1].ToString(),
                                Conn = reader[2].ToString(),
                                Selected = false
                            };
                            companies.Add(company);
                            
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.Message);
                }
            }

            using (SakilaContext db = new SakilaContext())
            {

            }

            return companies;
        }
    }
}