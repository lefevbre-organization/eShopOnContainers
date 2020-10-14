using Lexon.API;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public class ActuationsService : BaseClass<ActuationsService>, IActuationsService
    {
        public readonly IUsersRepository _usersRepository;
        private readonly IEventBus _eventBus;
        private readonly HttpClient _clientFiles;
        private readonly IOptions<LexonSettings> _settings;
        private string _conn;
        private string _urlLexon;

        public ActuationsService(
                IOptions<LexonSettings> settings
                , IUsersRepository usersRepository
                , IEventBus eventBus
                , ILogger<ActuationsService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _usersRepository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            ConfigureByEnv(null, null, _settings.Value, out _conn, out _urlLexon);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

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

        private string GiveMeActionFilter(string idUser, string bbdd, LexAction action)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetActionFilter(action) +
                $" }}";
        }


        private string GiveMeAppointmentFilter(string idUser, string bbdd, LexAppointment appointment)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetAppointmentFilter(appointment) +
                $" }}";
        }

        private string GiveMeAppointmentRemoveFilter(string idUser, string bbdd, int idAppointment)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetIdFilter("Id", idAppointment) +
                $" }}";
        }

        private string GiveMeAppointmentActionRemoveFilter(string idUser, string bbdd, int IdRelation)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetIdFilter(nameof(IdRelation), IdRelation) +
                $" }}";
        }

        private string GiveMeAppointmentActionFilter(string idUser, string bbdd, int idAppointment, int idAction)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetAppointmentActionFilter(idAppointment, idAction) +
                $" }}";
        }

        private string GetActuationSearchFilter(string idUser, string bbdd, string idType, int idCategory, string filter)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetTextFilter("IdType", idType) +
                GetLongFilter("IdCategory", idCategory) +
                GetTextFilter("filter", filter) +
            $" }}";
        }
        private string GetAppointmentFilter(LexAppointment appointment)
        {
            //set @P_JSON = '{"BBDD":"lexon_admin_02","IdUser":1344, "Subject":"test cita", "Location":"Madrid", "EndDate":"2020-03-30 20:31:30", "StartDate":"2020-03-28 20:31:30","IdEvent":{"IdEvent": "123456asdfadf132456789adfasdf", "Provider": "GMail"}}';
            //call PROC_CONN_APPOINTMENTS_INSERT(@P_JSON,1344,@P_ID,@P_ERROR);

            return $"{GetTextFilter("Subject", appointment.Subject)}" +
                $"{GetLongFilter("Id", appointment.Id)}" +
                $"{GetTextFilter("Location", appointment.Location)}" +
                $"{GetTextFilter("StartDate", appointment.StartDate)}" +
                $"{GetTextFilter("EndDate", appointment.EndDate)}" +
                $"{GetIdEventParameters("IdEvent", appointment.IdEvent, appointment.Provider)}";
        }

        private string GetActionFilter(LexAction action)
        {
//            '{"BBDD":"lexon_admin_02","IdUser":1344,"idType":"REUN","idCategory":"1","issue":"reunión","description":"nueva act desde correo","startDateFrom":"2019-07-30",
//"startDatetTo":"2019-07-31","last":"30","billable":"0","idStatus":"1","direction":"","PresentationDate":null,"expirationDate":"","economicEstimate":"","idAppointment":"",
//"related":"","contactsRelations":"","filesRelation":"","uid":"1234","idUser":"1344","Public":"0","idCompany":"88","idRate":null,"folder_id":"","idLexnet":"123",
//"relations":[{ "idEntityRelation":8,"idEntityTypeRelation":2},{ "idEntityRelation":7,"idEntityTypeRelation":2}]}';

            return $"{GetTextFilter("idType", action.IdType)}" +
                $"{GetTextFilter("idCategory", action.IdCategory)}" +
                $"{GetTextFilter("issue", action.Issue)}" +
                $"{GetTextFilter("description", action.Description)}" +
                $"{GetTextFilter("StartDateFrom", action.StartDateFrom)}" +
                $"{GetTextFilter("startDatetTo", action.StartDatetTo)}" ;
        }
        public string GetIdEventParameters(string name, string idEvent, string idProvider, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return  $"{comma}\"{name}\": {{ {GetTextFilter(name,idEvent, false)} {GetTextFilter("Provider", idProvider)} }}";
        }

        private string GetIdFilter(string idName, int idValue) {
            return $"{GetLongFilter(idName, idValue)}";

        }

        //private string GetAppointmentFilter(int idAppointment)
        //{
        //    //'{"BBDD":"lexon_admin_02","Id":401, "IdUser":"1344"}';
        //    return $"{GetLongFilter("Id", idAppointment)}";
        //}

        //private string GetRelationFilter(int idRelation)
        //{
        //    //'{"BBDD":"lexon_admin_02","Id":401, "IdUser":"1344"}';
        //    return $"{GetLongFilter("IdRelation", idRelation)}";
        //}

        private string GetAppointmentActionFilter(int idAppointment, int idAction)
        {
            //'{"BBDD":"lexon_admin_02","IdUser":1344, "idAppointment":402, "id":917}
            return $"{GetLongFilter("Id", idAction)}" +
                $"{GetLongFilter("idAppointment", idAppointment)}";
        }


        private string GiveMeSearchRelationsFilter(short? idType, string bbdd, string idUser, string idMail = "")
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetShortFilter("IdActionRelationType", idType) +
                    GetTextFilter("Uid", idMail) +
                    $" }}";
        }

        #endregion Common

        #region Actuations

        public async Task<Result<int>> UpsertAppointmentAsync(LexAppointment appointment, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeAppointmentFilter(idUser, bbdd, appointment);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointment, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                        result.data = (GetIntOutputParameter(command.Parameters["P_ID"].Value));
                    }
                }

                if (_settings.Value.UseMongo)
                {
                    //if (result.data > 0)
                    //    await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<int>> RemoveAppointmentAsync(int idAppointment, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeAppointmentRemoveFilter(idUser, bbdd, idAppointment);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveAppointment, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceOutputMessage(result.errors, "Mysql don´t remove the classification", null, "MySql Remove Data");
                //else
                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            }
            return result;
        }

        public async Task<Result<int>> AddAppointmentActionAsync(int idAppointment, int idAction, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeAppointmentActionFilter(idUser, bbdd, idAppointment, idAction);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointmentAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                        result.data = (GetIntOutputParameter(command.Parameters["P_ID"].Value));
                    }
                }

                if (_settings.Value.UseMongo)
                {
                    //if (result.data > 0)
                    //    await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuationType>>> GetActuationTypesAsync(string env, string idUser, string bbdd)
        {
            var pageIndex = 1;
            var pageSize = 0;
            var result = new Result<PaginatedItemsViewModel<LexActuationType>>(new PaginatedItemsViewModel<LexActuationType>(pageIndex, pageSize, 0, new List<LexActuationType>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = "{" + GetUserFilter(bbdd, idUser) + "}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuationTypes, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();

                        result.data.Count = AddOutPutParameters(result.errors, command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (PossibleHasData(result.errors, result.data.Count))
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuationType[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuationType>(pageIndex, pageSize, result.data.Count, resultado);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                await GetMasterActuationsMongoAsync(result);
            }

            return result;
        }

        private Task GetMasterActuationsMongoAsync(Result<PaginatedItemsViewModel<LexActuationType>> result)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuationCategory>>> GetActuationCategoriesAsync(string env, string idUser, string bbdd)
        {
            var pageIndex = 1;
            var pageSize = 0;
            var result = new Result<PaginatedItemsViewModel<LexActuationCategory>>(new PaginatedItemsViewModel<LexActuationCategory>(pageIndex, pageSize, 0, new List<LexActuationCategory>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = "{" + GetUserFilter(bbdd,idUser) + "}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuationCategories, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();

                        result.data.Count = AddOutPutParameters(result.errors, command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (PossibleHasData(result.errors, result.data.Count))
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuationCategory[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuationCategory>(pageIndex, pageSize, result.data.Count, resultado);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }

        private Task GetActuationCategoriesMongoAsync(Result<PaginatedItemsViewModel<LexActuationCategory>> result)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuation>>> GetActuationsAsync(
            string idType,
            int idCategory,
            string idUser,
            string env,
            string bbdd,
            string filter,
            int pageSize,
            int pageIndex)
        {
 
            var result = new Result<PaginatedItemsViewModel<LexActuation>>(new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, 0, new List<LexActuation>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetActuationSearchFilter(idUser, bbdd, idType, idCategory, filter);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuations, conn))
                    {
                        AddCommonParameters("0", command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();

                        result.data.Count = AddOutPutParameters(result.errors, command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (PossibleHasData(result.errors, result.data.Count))
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuation[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, result.data.Count, resultado);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }


        public async Task<Result<PaginatedItemsViewModel<LexActuation>>> GetClassificationsFromAppointmentAsync(
            string idAppointment,
            string idUser,
            string env,
            string bbdd,
            int pageSize,
            int pageIndex)
        {
            var result = new MySqlCompany(_settings.Value.SP.SearchRelations, pageIndex, pageSize, null, -1);

            ConfigureByEnv(env, result.Infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeSearchRelationsFilter(-1, null, idUser, idAppointment);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchAppointmentRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        result.AddOutPutParameters(command.Parameters["P_IDERROR"].Value, command.Parameters["P_ERROR"].Value, command.Parameters["P_TOTAL_REG"].Value);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = JsonConvert.DeserializeObject<LexMailActuation>(rawResult);
                                    result.AddRelationsMail(resultado);
                                }
                                else
                                {
                                    if (result.Infos.Count > 1)
                                        TraceOutputMessage(result.Errors, "MySql get and empty string with this search", null, "MySql Recover");
                                    else
                                        result.Infos.Add(new Info() { code = "515", message = "MySql get and empty string with this search" });
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.Errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                //if (result.TengoActuaciones())
                //    await _usersRepository.UpsertRelationsAsync(classification, result);
                //else
                //{
                //    var resultMongo = await _usersRepository.GetRelationsAsync(classification);
                //    result.DataActuation = resultMongo.DataActuation;
                //}
            }
            return new Result<PaginatedItemsViewModel<LexActuation>>();
            //return result;
        }

        public async Task<Result<int>> AddActionAsync(LexAction action, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GiveMeActionFilter(idUser, bbdd, action);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                        result.data = (GetIntOutputParameter(command.Parameters["P_ID"].Value));
                    }
                }

                if (_settings.Value.UseMongo)
                {
                    //if (result.data > 0)
                    //    await AddClassificationToListMongoAsync(classificationAdd, result);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }

            return result;
        }

        public async Task<Result<int>> RemoveAppointmentActionAsync(int idRelation, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GiveMeAppointmentRemoveFilter(idUser, bbdd, idRelation);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveAppointmentAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        TraceLog(parameters: new string[] { $"RESULT_P_ID:{command.Parameters["P_IDERROR"].Value}" });
                        TraceOutputMessage(result.errors, command.Parameters["P_ERROR"].Value, null, command.Parameters["P_IDERROR"].Value);
                    }
                }
                catch (Exception ex)
                {
                    TraceMessage(result.errors, ex);
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceOutputMessage(result.errors, "Mysql don´t remove the classification", null, "MySql Remove Data");
                //else
                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            }
            return result;
        }


        #endregion Actuations
    }
}