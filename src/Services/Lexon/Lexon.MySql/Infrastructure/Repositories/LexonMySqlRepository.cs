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

        public async Task<JosFilesList> SearchEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search)
        {
            var files = new JosFilesList();
            var filtroDescription = !string.IsNullOrEmpty(search) ? $", \"Description\":{search}" : string.Empty;
            var filtro = $"{{\"BBDD\":\"{bbdd}\",\"IdEntityType\":{idType},\"IdUser\":{idUser}{filtroDescription}}}";
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                files = JsonConvert.DeserializeObject<JosFilesList>(reader.GetValue(0).ToString());
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.Message);
                }
            }

            return files;
        }

        public async Task<JosEntitiesList> GetMasterEntitiesAsync()
        {
            var companies = new JosEntitiesList();

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
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

        public async Task<int> AddRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated)
        {
            int result = 0;
            var filtro = 
                $"{{\"BBDD\":\"{bbdd}\",\"Date\":\"2019-10-10\"," +
                $"\"Subject\":\"Test asociacion actuacion email CONECTA\"," +
                $" \"Body\":\"descripcion nueva actuacion\", \"Uid\":\"{idMail}\"," +
                $"\"IdUser\":\"{_settings.Value.UserApp}\", \"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}"; 

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        result = await command.ExecuteNonQueryAsync();
                        result = (int)command.Parameters["P_IDERROR"].Value;

                    }
                }
                catch (Exception ex)
                {
                    Console.Error.Write(ex.Message);
                }
            }

            return result;
        }
    }
}