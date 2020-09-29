﻿using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
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

        public async Task<Result<LexUser>> GetUserAsync(string idNavisionUser)
        {
            var result = new Result<LexUser>(new LexUser());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\"}}";
                    await GetUserCommon(result, conn, filtro);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceRepositoryError(result.errors, ex);
                }
            }
            return result;
        }

        public async Task<Result<LexUserSimple>> GetUserIdAsync(string idNavisionUser)
        {
            var result = new Result<LexUserSimple>(null);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"NavisionId\":\"{idNavisionUser}\",\"User\":1}}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, null, null, command);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    result.data = JsonConvert.DeserializeObject<LexUserSimple>(rawJson);
                                    result.data.idNavision = idNavisionUser;
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceRepositoryError(result.errors, ex);
                }
            }
            return result;
        }

        private async Task GetUserCommon(Result<LexUser> result, MySqlConnection conn, string filtro)
        {
            conn.Open();
            using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetCompanies, conn))
            {
                AddCommonParameters("0", command, "P_FILTER", filtro);
                AddListSearchParameters(0, 1, null, null, command);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    if (EvaluateErrorCommand(result.errors, command) == 0)
                        while (reader.Read())
                        {
                            var rawJson = reader.GetValue(0).ToString();
                            result.data = JsonConvert.DeserializeObject<LexUser>(rawJson);
                        }
                }
            }
        }

        public async Task<Result<LexUser>> GetCompaniesListAsync(string idUser)
        {
            var result = new Result<LexUser>(new LexUser());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{\"IdUser\":\"{idUser}\"}}";
                    await GetUserCommon(result, conn, filtro);
                }
                catch (Exception ex)
                {
                    result.data = null;
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        #region Entities

        public async Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchEntities, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchEntities, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    resultMySql.AddData(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors,  "MySql get and empty string with this search", null, "2004");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<MySqlCompany> GetFoldersFilesEntitiesAsync(IEntitySearchView entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchFoldersFiles, entitySearch.pageIndex, entitySearch.pageSize, ((EntitySearchView)entitySearch).bbdd, ((EntitySearchView)entitySearch).idType);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchEntitiesFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchFoldersFiles, conn))
                    {
                        AddCommonParameters(((EntitySearchView)entitySearch).idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(entitySearch.pageSize, entitySearch.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                    resultMySql.AddData(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "2004");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.GetEntity, 1, 1, entitySearch.bbdd, entitySearch.idType);
            var result = new Result<LexEntity>(new LexEntity());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeEntityFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetEntity, conn))
                    {
                        AddCommonParameters(entitySearch.idUser, command, "P_FILTER", filtro);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        var resultado = (JsonConvert.DeserializeObject<LexCompany>(rawResult));
                                        resultMySql.AddData(resultado);
                                    }
                                    else
                                    {
                                        if (resultMySql.Infos.Count > 1)
                                            TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "2004");
                                        else
                                            resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                    }
                                }
                        }
                    }
                    result.data = resultMySql?.Data?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch)
        {
            var result = new Result<LexContact>(new LexContact());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeEntityFilter(entitySearch);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetContact, conn))
                    {
                        AddCommonParameters(entitySearch.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null,  command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        var lista = (JsonConvert.DeserializeObject<LexContact[]>(rawResult).ToList());
                                        result.data = lista?.FirstOrDefault();
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors, "MySql get and empty string with this search", null, "2004");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }


        public async Task<Result<List<LexContact>>> GetAllContactsAsync(BaseView search)
        {
            var result = new Result<List<LexContact>>(new List<LexContact>());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeBaseFilter(search.bbdd, search.idUser);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetAllContacts, conn))
                    {
                        AddCommonParameters(search.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        result.data = (JsonConvert.DeserializeObject<LexContact[]>(rawResult).ToList());
                                        CompleteContacts(search, result);
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors, "2004", "MySql get and empty string with this search");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        private void CompleteContacts(BaseView search, Result<List<LexContact>> result)
        {
            try
            {
                foreach (var contact in result.data)
                {
                    if (contact.IdType == null) continue;

                    contact.EntityType = contact.IdType != null ? Enum.GetName(typeof(LexonAdjunctionType), contact.IdType) : null;
                    contact.Tags = new string[] { search.bbdd, search.idUser, contact.EntityType };
                }
            }
            catch (Exception ex)
            {
                result.infos.Add(new Info() { code = "ErorCompleteContact", message = $"Error no controlado al completar datos del contacto + {ex.Message}" });
            }
        }

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync()
        {
            var resultMySql = new MySqlList<JosEntityTypeList, JosEntityType>(new JosEntityTypeList(), _settings.Value.SP.GetMasterEntities, 1, 0);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = "{}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetMasterEntities, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);

                        AddListSearchParameters(resultMySql.PageSize, resultMySql.PageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (resultMySql.PossibleHasData())
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<JosEntityTypeList>(rawJson));
                                    resultMySql.AddData(resultado, resultado.Entities);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity folderToEntity)
        {
            var result = new Result<long>(0);
            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    string filtro = GeFolderCreateFilter(folderToEntity);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddEntityFolder, conn))
                    {
                        AddCommonParameters(folderToEntity.idUser, command, "P_JSON", filtro, true);

                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null,  command.Parameters["P_IDERROR"].Value);
                        result.data = GetIntOutputParameter(command.Parameters["P_ID"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        #endregion Entities

        #region Relations

        public async Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification)
        {
            var resultMySql = new MySqlCompany(_settings.Value.SP.SearchRelations, classification.pageIndex, classification.pageSize, classification.bbdd, classification.idType);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchRelationsFilter(classification.idType, classification.bbdd, classification.idUser, classification.idMail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchRelations, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(classification.pageSize, classification.pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        resultMySql.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = JsonConvert.DeserializeObject<LexMailActuation>(rawResult);
                                    resultMySql.AddRelationsMail(resultado);
                                }
                                else
                                {
                                    if (resultMySql.Infos.Count > 1)
                                        TraceOutputMessage(resultMySql.Errors, "MySql get and empty string with this search", null, "2004");
                                    else
                                        resultMySql.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(resultMySql.Errors, ex);
                }
            }

            return resultMySql;
        }

        public async Task<Result<LexUserSimpleCheck>> CheckRelationsMailAsync(string idUser, MailInfo mail)
        {
            var result = new Result<LexUserSimpleCheck>(new LexUserSimpleCheck());

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeCheckMailFilter(idUser, mail);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.CheckRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(1, 1, "ts", "desc", command);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null,  command.Parameters["P_IDERROR"].Value);
                            if (EvaluateErrorCommand(result.errors, command) == 0)
                                while (reader.Read())
                                {
                                    var rawResult = reader.GetValue(0).ToString();
                                    if (!string.IsNullOrEmpty(rawResult))
                                    {
                                        result.data = (JsonConvert.DeserializeObject<LexUserSimpleCheck>(rawResult));
                                    }
                                    else
                                    {
                                        TraceOutputMessage(result.errors, "MySql get and empty string with this search", null, "2004");
                                    }
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }
        public async Task<Result<List<int>>> AddRelationMailAsync(ClassificationAddView classification)
        {
            var result = new Result<List<int>>(new List<int>());
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    conn.Open();
                    foreach (var mail in classification.listaMails)
                    {
                        mail.Subject = RemoveProblematicChars(mail.Subject);
                        var listaUnicaMails = new MailInfo[] { mail };
                        var filtro = GiveMeRelationMultipleFilter(classification.bbdd, classification.idUser, listaUnicaMails, classification.idType, classification.idRelated);

                        using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddRelation, conn))
                        {
                            AddCommonParameters(classification.idUser, command, "P_JSON", filtro, true);
                            await command.ExecuteNonQueryAsync();
                            TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                            TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                            result.data.Add(GetIntOutputParameter(command.Parameters["P_ID"].Value));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                TraceRepositoryError(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification)
        {
            var result = new Result<int>(0);
            var mailInfo = new MailInfo(classification.Provider, classification.MailAccount, classification.idMail);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeRelationFilter(classification.bbdd, classification.idUser, mailInfo, classification.idType, classification.idRelated, null);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveRelation, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null,  command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification)
        {
            var result = new Result<int>(0);
            classification.mail.Subject = RemoveProblematicChars(classification.mail.Subject);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    string filtro = GiveMeRelationFilter(classification.bbdd, classification.idUser, classification.mail, null, null, classification.ContactList);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddContactRelations, conn))
                    {
                        AddCommonParameters(classification.idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceRepositoryError(result.errors, ex);
                }
            }

            return result;
        }

        #endregion Relations

        #region Common

        private void AddCommonParameters(string idUser, MySqlCommand command, string nameFilter = "P_FILTER", string filterValue = "{}", bool addParameterId = false)
        {
            command.Parameters.Add(new MySqlParameter(nameFilter, MySqlDbType.String) { Value = filterValue });
            command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
            command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
            if (addParameterId)
                command.Parameters.Add(new MySqlParameter("P_ID", MySqlDbType.Int32) { Direction = ParameterDirection.Output });

            command.CommandType = CommandType.StoredProcedure;

            TraceLog(parameters: new string[] { $"conn:{_conn}", $"SP:{command.CommandText} {nameFilter}='{filterValue}', P_UC={idUser}" });
        }

        private void AddListSearchParameters(int pageSize, int pageIndex, string fieldOrder, string order, MySqlCommand command)
        {
            TraceLog(parameters: new string[] { $"P_PAGE_SIZE:{pageSize} - P_PAGE_NUMBER:{pageIndex} - P_ORDER:{fieldOrder} - P_TYPE_ORDER:{order}" });

            command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
            command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
            command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            if (!string.IsNullOrEmpty(fieldOrder))
                command.Parameters.Add(new MySqlParameter("P_ORDER", MySqlDbType.String) { Value = fieldOrder });
            if (!string.IsNullOrEmpty(order))
                command.Parameters.Add(new MySqlParameter("P_TYPE_ORDER", MySqlDbType.String) { Value = order });
        }

        private int EvaluateErrorCommand(List<ErrorInfo> errors, MySqlCommand command)
        {
            int idError = 0;
            if (command.Parameters["P_IDERROR"].Value is int)
            {
                int.TryParse(command.Parameters["P_IDERROR"].Value.ToString(), out idError);
                TraceOutputMessage(errors, command.Parameters["P_ERROR"].Value, null, idError);
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

        private string GiveMeBaseFilter(string bbdd, string idUser)
        {
            return $"{{ {GetUserFilter(bbdd, idUser)} }}";
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
            var bbddParam = bbdd != null ? $"\"BBDD\":\"{bbdd}\"," : "";
            return $"{comma}{bbddParam}\"IdUser\":{idUser}";
        }

        private string GetMailFilter(MailInfo mail)
        {
            return $"{GetTextFilter("Provider", mail.Provider)}" +
                $"{GetTextFilter("MailAccount", mail.MailAccount)}" +
                $"{GetTextFilter("Uid", mail.Uid)}" +
                $"{GetTextFilter("Subject", mail.Subject)}" +
                $"{GetTextFilter("Folder", mail.Folder)}" +
                $"{GetTextFilter("Date", mail.Date)}";
        }

        private string GiveMeCheckMailFilter(string idUser, MailInfo mail)
        {
            return $"{{ " +
                    GetUserFilter(null, idUser) +
                    GetMailIdFilter(mail) +
                    $" }}";
        }

        private string GetMailIdFilter(MailInfo mail)
        {
            return $"{GetTextFilter("Provider", mail.Provider)}" +
                $"{GetTextFilter("MailAccount", mail.MailAccount)}" +
                $"{GetTextFilter("Uid", mail.Uid)}" +
                $"{GetTextFilter("Folder", mail.Folder)}";
        }

        private string GeFolderCreateFilter(FolderToEntity folderToEntity)
        {
            return $"{{ " +
                $"{GetTextFilter("BBDD", folderToEntity.bbdd, false)}" +
                $"{GetShortFilter("IdEntityType", folderToEntity.idType)}" +
                $"{GetLongFilter("IdParent", folderToEntity.IdParent)}" +
                $"{GetTextFilter("Name", folderToEntity.Name)}" +
                $"{GetLongFilter("IdRelated", folderToEntity.idEntity)}" +
                    $" }}";
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

        private string GiveMeSearchEntitiesFilter(IEntitySearchView search)
        {
            return $"{{ " +
                    GetUserFilter(((EntitySearchView)search).bbdd, ((EntitySearchView)search).idUser) +
                    GetShortFilter("IdEntityType", ((EntitySearchView)search).idType) +
                    GetTextFilter("Description", search.search) +
                    GetFolderDocumentFilter(search) +
                    $" }}";
        }

        private string GiveMeEntityFilter(EntitySearchById search)
        {
            return $"{{ " +
                    GetUserFilter(search.bbdd, search.idUser) +
                    GetShortFilter("IdEntityType", search.idType) +
                    GetLongFilter("IdRelation", search.idEntity) +
                    $" }}";
        }

        private string GetFolderDocumentFilter(IEntitySearchView search)
        {
            if (search is EntitySearchFoldersView || search == null)
                return $"{GetLongFilter("IdParent", (search as EntitySearchFoldersView)?.idParent)}{GetLongFilter("IdFolder", (search as EntitySearchFoldersView)?.idFolder)}";
            else if (search is EntitySearchDocumentsView)
                return $"{GetLongFilter("IdFolder", (search as EntitySearchDocumentsView)?.idFolder)}";

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