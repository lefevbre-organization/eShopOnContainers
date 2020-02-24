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
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }
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
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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

        public async Task<MySqlList<JosEntityList, JosEntity>> SearchEntitiesAsync(EntitySearchView entitySearch)
        {
            var resultMySql = new MySqlList<JosEntityList, JosEntity>(new JosEntityList(), _settings.Value.SP.SearchEntities, entitySearch.pageIndex, entitySearch.pageSize);
            string filtro = GiveMeSearchEntitiesFilter(entitySearch.idType, entitySearch.bbdd, entitySearch.idUser, entitySearch.search, entitySearch.idFilter);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchEntities}", $"P_FILTER:{filtro}", $"P_UC:{entitySearch.idUser}-pageSize:{entitySearch.pageSize}-pageIndex:{entitySearch.pageIndex}" });

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
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = entitySearch.idUser });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = entitySearch.pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = entitySearch.pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {

                            if (resultMySql.PossibleHasData())
                            {
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        var resultado = (JsonConvert.DeserializeObject<JosEntityList>(rawResult));
                                        resultMySql.AddData(resultado, resultado.Entities);

                                    }
                                    else { 
                                        TraceOutputMessage(resultMySql.Errors, "2004", "MySql get and empty string with this search"); }
                                }
                            }
                        }

                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<Result<JosEntity>> GetEntityAsync(EntitySearchById entitySearch)
        {
            var result = new Result<JosEntity>(new JosEntity());
            string filtro = GiveMeEntityFilter(entitySearch.bbdd, entitySearch.idUser, (short)entitySearch.idType, entitySearch.idEntity);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchEntities}", $"P_FILTER:{filtro}", $"P_UC:{entitySearch.idUser}" });

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
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = entitySearch.idUser });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync()
        {
            var filter = "{}";
            var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>(new JosEntityTypeList(), _settings.Value.SP.GetMasterEntities, 1, 0);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filter });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = 0 });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = resultMySql.PageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = resultMySql.PageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                          //  resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                            if (resultMySql.PossibleHasData())
                            {
                                while (reader.Read())
                                {
                                    var resultado = (JsonConvert.DeserializeObject<JosEntityTypeList>(reader.GetValue(0).ToString()));
                                    resultMySql.AddData(resultado, resultado.Entities);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        #endregion Entities

        #region Relations

        public async Task<Result<JosRelationsList>> SearchRelationsAsync(ClassificationSearchView classification)
        {
            var result = new Result<JosRelationsList>(new JosRelationsList());
            var filtro = GiveMeSearchRelationsFilter(classification.idType, classification.bbdd, classification.idUser, classification.idMail);
            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.SearchRelations}", $"P_FILTER:{filtro}", $"P_UC:{classification.idUser}-pageSize:{classification.pageSize}-pageIndex:{classification.pageIndex}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchRelations, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_FILTER", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = classification.idUser });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = classification.pageSize });
                        command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = classification.pageIndex });
                        command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
                        command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
                        command.CommandType = CommandType.StoredProcedure;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, command.Parameters["P_IDERROR"].Value);
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

        public async Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification)
        {
            int a = 0;
            var result = new Result<int>(a);
            string filtro = GiveMeRelationMultipleFilter(classification.bbdd, classification.idUser, classification.listaMails, classification.idType, classification.idRelated);

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.AddRelation}", $"P_FILTER:{filtro}", $"P_UC:{classification.idUser}" });

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = classification.idUser });
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

        public async Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification)
        {
            int a = 0;
            var result = new Result<int>(a);
            var mailInfo = new MailInfo(classification.Provider, classification.MailAccount, classification.idMail);
            var filtro = GiveMeRelationFilter(classification.bbdd, classification.idUser, mailInfo, classification.idType, classification.idRelated, null);

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.RemoveRelation}", $"P_FILTER:{filtro}", $"P_UC:{classification.idUser}" });
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveRelation, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = classification.idUser });
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

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            int a = 0;
            var result = new Result<int>(a);
            string filtro = GiveMeRelationFilter(classification.bbdd, classification.idUser, classification.mail, null, null, classification.ContactList);

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{_settings.Value.SP.AddContactRelations}", $"P_FILTER:{filtro}", $"P_UC:{classification.idUser}" });
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddContactRelations, conn))
                    {
                        command.Parameters.Add(new MySqlParameter("P_JSON", MySqlDbType.String) { Value = filtro });
                        command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = classification.idUser });
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