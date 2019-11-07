using Lexon.MySql.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Repositories
{
    public class LexonMySqlRepository : BaseClass<LexonMySqlRepository>, ILexonMySqlRepository
    {
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;

        public LexonMySqlRepository(
               IOptions<LexonSettings> settings
            , ILogger<LexonMySqlRepository> logger

            ):base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _conn = _settings.Value.ConnectionString;
        }

        public async Task<Result<JosUserCompanies>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<JosUserCompanies>  {  errors = new List<ErrorInfo>() };
            var filtro = $"{{\"NavisionId\":\"{idUser}\"}}";
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.GetCompanies}", $"P_FILTER:{filtro}", $"P_UC:{_settings.Value.UserApp}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                result.data = JsonConvert.DeserializeObject<JosUserCompanies>(reader.GetValue(0).ToString());
                            }
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }


        public async Task<Result<JosEntityList>> SearchEntitiesAsync(int pageSize, int pageIndex, short idType, string bbdd, string idUser, string search, long idFilter)
        {
            var result = new Result<JosEntityList> { errors = new List<ErrorInfo>() };
            string filtro = GiveMeFilter(idType, bbdd, idUser, search, idFilter);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchEntities}", $"P_FILTER:{filtro}", $"P_UC:{_settings.Value.UserApp}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                result.data = JsonConvert.DeserializeObject<JosEntityList>(reader.GetValue(0).ToString());
                            }
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                        }

                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        private string GiveMeFilter(short idType, string bbdd, string idUser, string search, long idFilter)
        {
            var filtroDescription = !string.IsNullOrEmpty(search) ? $", \"Description\":{search}" : string.Empty;

            var filter = $"\"BBDD\":\"{bbdd}\",\"IdEntityType\":{idType},\"IdUser\":{idUser}{filtroDescription}";

            if (idType == (short)LexonAssociationType.MailToDocumentsEvent && idFilter > 0)
                filter = $"{{ {filter},\"IdParent\":{idFilter} }}";
            else if (idType == (short)LexonAssociationType.MailToFilesEvent)
                filter = $"{{ {filter},\"IdFolder\":{idFilter} }}";
            else
                filter = $"{{ {filter} }}";
            return filter;
        }


        public async Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync()
        {
            var result = new Result<JosEntityTypeList> { errors = new List<ErrorInfo>() };
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.GetMasterEntities}", $"P_UC:{_settings.Value.UserApp}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                result.data = JsonConvert.DeserializeObject<JosEntityTypeList>(reader.GetValue(0).ToString());
                            }
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, string[] listaMails, long idRelated)
        {
            var result = new Result<int> { errors = new List<ErrorInfo>() };

        
            var filtro =
                $"{{\"BBDD\":\"{bbdd}\",\"Date\":\"2019-10-10\"," +
                $"\"Subject\":\"Test asociacion actuacion email CONECTA\"," +
                $" \"Body\":\"descripcion nueva actuacion\", \"Uid\":{JsonConvert.SerializeObject(listaMails)}," +
                $"\"IdUser\":\"{idUser}\", \"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}";


            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.AddRelation}", $"P_FILTER:{filtro}", $"P_UC:{_settings.Value.UserApp}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        command.Parameters.Add(new MySqlParameter("P_ID", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString())
                            ? -1
                            : (int)command.Parameters["P_ID"].Value;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_ID"].Value}"});
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated)
        {
            var result = new Result<int> { errors = new List<ErrorInfo>() };
            var filtro =
                $"{{\"BBDD\":\"{bbdd}\"," +
                $" \"Uid\":\"{idMail}\"," +
                $" \"IdUser\":\"{idUser}\", \"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}";

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.RemoveRelation}", $"P_FILTER:{filtro}", $"P_UC:{_settings.Value.UserApp}" });
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = _settings.Value.UserApp });
                        //command.Parameters.Add(new MySqlParameter("P_ID", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString())
                            ? -1
                            : (int)command.Parameters["P_ID"].Value;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
        }
    }
}