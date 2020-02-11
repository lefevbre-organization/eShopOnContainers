using Lexon.MySql.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
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
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read()) { result.data = JsonConvert.DeserializeObject<JosUser>(reader.GetValue(0).ToString()); }
                        }

                        WriteLine($"respuesta idUser:{result.data.IdUser}"); //para quitar

                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }
            WriteLine($"Salimos de GetUserAsync"); //para quitar
            return result;
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
                                while (reader.Read()) { result.data = JsonConvert.DeserializeObject<JosUserCompanies>(reader.GetValue(0).ToString()); }
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

        #region Entities

        public async Task<Result<JosEntityList>> SearchEntitiesAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string search, long? idFilter)
        {
            var result = new Result<JosEntityList>(new JosEntityList());
            string filtro = GiveMeSearchEntitiesFilter(idType, bbdd, idUser, search, idFilter);
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
                                while (reader.Read()) { result.data = JsonConvert.DeserializeObject<JosEntityList>(reader.GetValue(0).ToString(), jsonSerializerSettings); }
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

        public async Task<Result<JosEntity>> GetEntityAsync(string bbdd, string idUser, short idType, long idEntity)
        {
            var result = new Result<JosEntity>(new JosEntity());
            string filtro = GiveMeEntityFilter(bbdd, idUser, idType, idEntity);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchEntities}", $"P_FILTER:{filtro}", $"P_UC:{idUser}" });

            var jsonSerializerSettings = new JsonSerializerSettings();
            jsonSerializerSettings.MissingMemberHandling = MissingMemberHandling.Ignore;

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var listaResultados = new JosEntityList();
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetEntity, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read()) { listaResultados = JsonConvert.DeserializeObject<JosEntityList>(reader.GetValue(0).ToString(), jsonSerializerSettings); }
                        }
                    }
                    result.data = listaResultados?.Entities?.Length == 1 ? listaResultados?.Entities[0] : null;
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            return result;
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
                                while (reader.Read()) { result.data = JsonConvert.DeserializeObject<JosEntityTypeList>(reader.GetValue(0).ToString()); }
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

        #endregion Entities

        #region Relations

        public async Task<Result<JosRelationsList>> SearchRelationsAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string idMail)
        {
            var result = new Result<JosRelationsList>(new JosRelationsList());
            var filtro = GiveMeSearchRelationsFilter(idType, bbdd, idUser, idMail);
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
                                while (reader.Read()) { result.data = JsonConvert.DeserializeObject<JosRelationsList>(reader.GetValue(0).ToString()); }
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
            string filtro = GiveMeRelationMultipleFilter(bbdd, idUser, listaMails, idType, idRelated);

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

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string provider, string mailAccount, string uidMail, long idRelated)
        {
            int a = 0;
            var result = new Result<int>(a);
            var mailInfo = new MailInfo(provider, mailAccount, uidMail);
            string filtro = GiveMeRelationFilter(bbdd, idUser, mailInfo, idType, idRelated, null);

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

        public async Task<Result<int>> AddRelationContactsMailAsync(string bbdd,
                                                        string idUser,
                                                        MailInfo mailInfo,
                                                        string[] contactList)
        {
            int a = 0;
            var result = new Result<int>(a);
            string filtro = GiveMeRelationFilter(bbdd, idUser, mailInfo, null, null, contactList);

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.AddContactRelations}", $"P_FILTER:{filtro}", $"P_UC:{idUser}" });
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddContactRelations, conn))
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

        #endregion Relations

        #region Common

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

        private string GiveMeRelationFilter(string bbdd, string idUser, MailInfo mailInfo, short? idType, long? idRelated, string[] contactList)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailFilter(mailInfo) +
                GetContactList("ContactList", contactList) +
                $" }}";
        }

        private string GetContactList(string name, string[] list, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return list != null ? $"{comma}\"{name}\":{JsonConvert.SerializeObject(list)}" : string.Empty;
        }

        private string GiveMeRelationMultipleFilter(string bbdd, string idUser, MailInfo[] listaMails, short? idType, long? idRelated)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetRelationByIdFilter(idType, idRelated) +
                GetMailListFilter("ListaMails", listaMails) +
                $" }}";
        }

        private static string GetUserFilter(string bbdd, string idUser, bool withComma = false)
        {
            var comma = withComma ? ", " : "";
            return $"{comma}\"BBDD\":\"{bbdd}\",\"IdUser\":{idUser}";
        }

        private string GetMailFilter(MailInfo mail)
        {
            return $"{GetTextFilter("Provider", mail.Provider)}" +
                $"{GetTextFilter("MailAccount", mail.MailAccount)}" +
                $"{GetTextFilter("Uid", mail.Uid)}" +
                $"{GetTextFilter("Subject", mail.Subject)}" +
                $"{GetTextFilter("Date", mail.Date)}";
        }

        private string GetMailListFilter(string name, MailInfo[] mailInfoList, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return $"{comma}\"{name}\":{JsonConvert.SerializeObject(mailInfoList)}";
        }

        private string GetRelationByIdFilter(short? idType, long? idRelated)
        {
            return idType != null && idRelated != null
                ? $"{GetShortFilter("IdActionRelationType", idType)}{GetLongFilter("IdRelation", idRelated)}"
                : string.Empty;
        }

        private string GiveMeSearchRelationsFilter(short? idType, string bbdd, string idUser, string idMail = "")
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetShortFilter("IdActionRelationType", idType) +
                    GetTextFilter("Uid", idMail) +
                    $" }}";
        }

        private string GiveMeSearchEntitiesFilter(short? idType, string bbdd, string idUser, string search, long? idFilter)
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetShortFilter("IdEntityType", idType) +
                    GetTextFilter("Description", search) +
                    GetEntityFilter(idType, idFilter) +
                    $" }}";
        }

        private string GiveMeEntityFilter(string bbdd, string idUser, short idType, long idEntity)
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetShortFilter("IdEntityType", idType) +
                    GetLongFilter("IdRelation", idEntity) +
                    $" }}";
        }

        private string GetEntityFilter(short? idType, long? idFilter)
        {
            if (idType == null)
                return "";
            else if (idType == (short)LexonAssociationType.MailToDocumentsEvent)
                return $"{GetLongFilter("IdFolder", idFilter)}";
            else if (idType == (short)LexonAssociationType.MailToFoldersEvent)
                return $"{GetLongFilter("IdParent", idFilter)}";
            return "";
        }

        private string GetLongFilter(string name, long? param, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            var paramString = param == null ? "null" : param.ToString();
            return param != null ? $"{comma}\"{name}\":{paramString}" : string.Empty;
        }

        private string GetShortFilter(string name, short? param, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            var paramString = param == null ? "null" : param.ToString();
            return $"{comma}\"{name}\":{paramString}";
        }

        private string GetTextFilter(string name, string value, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return !string.IsNullOrEmpty(value) ? $"{comma}\"{name}\":\"{value}\"" : string.Empty;
        }

        #endregion Common
    }
}