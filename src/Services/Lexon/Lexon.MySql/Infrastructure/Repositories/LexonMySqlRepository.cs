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

            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _conn = _settings.Value.ConnectionString;
        }

        public async Task<Result<JosUserCompanies>> GetCompaniesListAsync(int pageSize, int pageIndex, string idUser)
        {
            var result = new Result<JosUserCompanies>(new JosUserCompanies());
            var filtro = $"{{\"IdUser\":\"{idUser}\"}}";
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.GetCompanies}", $"P_FILTER:{filtro}", $"P_UC:{idUser}", $"pageSize:{pageSize}", $"pageIndex:{pageIndex}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())  {  result.data = JsonConvert.DeserializeObject<JosUserCompanies>(reader.GetValue(0).ToString());  }
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

        private int EvaluateErrorCommand(List<ErrorInfo> errors, MySqlCommand command)
        {
            int idError = 0;
            if (command.Parameters["P_IDERROR"].Value is int)
            {
                int.TryParse(command.Parameters["P_IDERROR"].Value.ToString(), out idError);
                TraceOutputMessage(errors, command.Parameters["P_ERROR"].Value, idError);
            }

            return idError;
        }

        public async Task<Result<JosEntityList>> SearchEntitiesAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string search, long? idFilter)
        {
            var result = new Result<JosEntityList>(new JosEntityList());
            string filtro = GiveMeFilter(idType, bbdd, idUser, search, idFilter);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchEntities}", $"P_FILTER:{filtro}", $"P_UC:{idUser}", $"pageSize:{pageSize}", $"pageIndex:{pageIndex}" });

            var jsonSerializerSettings = new JsonSerializerSettings();
            jsonSerializerSettings.MissingMemberHandling = MissingMemberHandling.Ignore;

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())  {  result.data = JsonConvert.DeserializeObject<JosEntityList>(reader.GetValue(0).ToString(), jsonSerializerSettings);   }
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

        private string GiveMeFilter(short? idType, string bbdd, string idUser, string search, long? idFilter, string idMail = "")
        {
            var filtroDescription = !string.IsNullOrEmpty(search) ? $", \"Description\":\"{search}\"" : string.Empty;

            var textIdFilter = idType == null ? "null" : idType.ToString();
            var filter = $"\"BBDD\":\"{bbdd}\",\"IdEntityType\":{textIdFilter},\"IdUser\":{idUser}{filtroDescription}";

            if (idType == (short)LexonAssociationType.MailToDocumentsEvent && idFilter != null)
                filter = $"{{{filter},\"IdFolder\":{idFilter}}}";
            else if (idType == (short)LexonAssociationType.MailToFoldersEvent && idFilter != null)
                filter = $"{{{filter},\"IdParent\":{idFilter}}}";
            else if (idType == null || idType == (short)LexonAssociationType.MailToFilesEvent && !string.IsNullOrEmpty(idMail))
                filter = $"{{{filter},\"Uid\":\"{idMail}\"}}";
            else
                filter = $"{{{filter}}}";
            return filter;
        }

        public async Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync()
        {
            var pageSize = 0;
            var pageIndex = 1;
            var filter = "{}";
            var result = new Result<JosEntityTypeList>(new JosEntityTypeList());
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.GetMasterEntities}", $"P_UC:{_settings.Value.UserApp}", $"pageSize:{pageSize}", $"pageIndex:{pageIndex}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filter });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = 0 });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())  {  result.data = JsonConvert.DeserializeObject<JosEntityTypeList>(reader.GetValue(0).ToString());  }
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

        public async Task<Result<JosRelationsList>> SearchRelationsAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string idMail)
        {
            var result = new Result<JosRelationsList>(new JosRelationsList());
            var filtro = GiveMeFilter(idType, bbdd, idUser, null, null, idMail);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchRelations}", $"P_FILTER:{filtro}", $"P_UC:{idUser}", $"pageSize:{pageSize}", $"pageIndex:{pageIndex}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchRelations, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())   {   result.data = JsonConvert.DeserializeObject<JosRelationsList>(reader.GetValue(0).ToString());  }
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

        public async Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, MailInfo[] listaMails, long idRelated)
        {
            int a = 0;
            var result = new Result<int>(a);

            //var filtro =
            //    $"{{\"BBDD\":\"{bbdd}\",\"Date\":\"2019-10-10\"," +
            //    $"\"Subject\":\"lista\"," +
            //    $"\"Body\":\"descripcion nueva actuacion\",\"Uid\":{JsonConvert.SerializeObject(listaMails)}," +
            //    $"\"IdUser\":\"{idUser}\",\"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}";

            var filtro =
                $"{{\"BBDD\":\"{bbdd}\",\"ListaMails\":{JsonConvert.SerializeObject(listaMails)}," +
                $"\"IdUser\":\"{idUser}\",\"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}";

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.AddRelation}", $"P_FILTER:{filtro}", $"P_UC:{idUser}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1: 1;
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

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated)
        {
            int a = 0;
            var result = new Result<int>(a);
            var filtro =
                $"{{\"BBDD\":\"{bbdd}\"," +
                $"\"Uid\":\"{idMail}\"," +
                $"\"IdUser\":\"{idUser}\",\"IdActionRelationType\":{idType},\"IdRelation\":{idRelated}}}";

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.RemoveRelation}", $"P_FILTER:{filtro}", $"P_UC:{idUser}" });
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
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

        public async Task<Result<JosUser>> GetUserAsync(string idNavisionUser)
        {
            var pageSize = 0;
            var pageIndex = 1;
            var result = new Result<JosUser>(new JosUser());
            var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\"}}";
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.GetUserDetails}", $"P_FILTER:{filtro}", $"P_UC:{_settings.Value.UserApp}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = 0 });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });

                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())  {  result.data = JsonConvert.DeserializeObject<JosUser>(reader.GetValue(0).ToString());   }
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
    }
}