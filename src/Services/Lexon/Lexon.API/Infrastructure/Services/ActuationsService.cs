﻿using Lexon.API;
using Lexon.API.Infrastructure.Exceptions;
using Lexon.API.Infrastructure.Repositories;
using Lexon.API.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using Polly.Caching;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Lexon.Infrastructure.Services
{
    public class ActuationsService : LexonBaseClass<ActuationsService>, IActuationsService
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
            ConfigureByEnv(null, null, _settings.Value, out _conn, out _urlLexon, Codes.Lexon.Generic);

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            _clientFiles = new HttpClient(handler) { BaseAddress = new Uri(_urlLexon) };
            _clientFiles.DefaultRequestHeaders.Add("Accept", "text/plain");
        }

        #region Common

        
        public string GetIdEventParameters(string name, string idEvent, string idProvider, bool withComma = true)
        {
            var comma = withComma ? ", " : "";
            return  $"{comma}\"{name}\": {{ {GetTextFilter(name, idEvent, false)} {GetTextFilter("provider", idProvider)} }}";
        }

        private string GetIdFilter(string idName, int idValue) {
            return $"{GetLongFilter(idName, idValue)}";

        }

        #endregion Common

        #region Actuations

        #region Appointments

        public async Task<Result<int>> UpsertAppointmentAsync(LexAppointment appointment, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.UpsertAppointment);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GetUpsertAppointmentFilter(idUser, bbdd, appointment);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointment, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.UpsertAppointment, nameof(UpsertAppointmentAsync));

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
                TraceError(result.errors, new LexonDomainException($"Error when add appointment to lexon", ex), Codes.LexonActuations.UpsertAppointment, "MYSQLCONN");
            }

            return result;
        }

        private string GetUpsertAppointmentFilter(string idUser, string bbdd, LexAppointment appointment)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetTextFilter("subject", appointment.Subject) +
                GetLongFilter("id", appointment.Id) +
                GetTextFilter("location", appointment.Location) +
                GetTextFilter("startDate", appointment.StartDate) +
                GetTextFilter("endDate", appointment.EndDate) +
                GetIdEventParameters("idEvent", appointment.IdEvent, appointment.Provider) +
                $" }}";
        }

        public async Task<Result<int>> RemoveAppointmentAsync(int idAppointment, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.RemoveAppointment);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetRemoveAppointmentFilter(idUser, bbdd, idAppointment);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveAppointment, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.RemoveAppointment, nameof(RemoveAppointmentAsync));
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when remove appointment of lexon", ex), Codes.LexonActuations.RemoveAppointment, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceError(result.errors, new LexonDomainException($"Mysql don´t remove the classification"), Codes.LexonActuations.RemoveAppointment, "MYSQL");
                //else
                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            }
            return result;
        }

        private string GetRemoveAppointmentFilter(string idUser, string bbdd, int idAppointment)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetIdFilter("Id", idAppointment) +
                $" }}";
        }

        public async Task<Result<int>> AddAppointmentActionAsync(int idAppointment, int idAction, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.AddAppointmentAction);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GetAddAppointmentActionFilter(idUser, bbdd, idAppointment, idAction);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAppointmentAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.AddAppointmentAction, nameof(AddAppointmentActionAsync));
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
                TraceError(result.errors, new LexonDomainException($"Error when add appointment to action", ex), Codes.LexonActuations.AddAppointmentAction, "MYSQLCONN");
            }

            return result;
        }

        private string GetAddAppointmentActionFilter(string idUser, string bbdd, int idAppointment, int idAction)
        {
            //'{"BBDD":"lexon_admin_02","IdUser":1344, "idAppointment":402, "id":917}
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                $"{GetLongFilter("id", idAction)}" +
                $"{GetLongFilter("idAppointment", idAppointment)}" +
                $" }}";
        }
      
        public async Task<Result<int>> RemoveAppointmentActionAsync(int idRelation, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.RemoveAppointmentAction);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetRemoveAppointmentActionFilter(idUser, bbdd, idRelation);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.RemoveAppointmentAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro);
                        await command.ExecuteNonQueryAsync();
                        result.data = !string.IsNullOrEmpty(command.Parameters["P_IDERROR"].Value.ToString()) ? -1 : 1;
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.RemoveAppointmentAction, nameof(RemoveAppointmentAsync));

                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when remove appointment of lexon", ex), Codes.LexonActuations.RemoveAppointmentAction, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                if (result.data == 0)
                    TraceError(result.errors, new LexonDomainException($"Mysql don´t remove the classification"), Codes.LexonActuations.RemoveAppointmentAction, "MYSQL");
                //else
                //    await RemoveClassificationFromListMongoAsync(classificationRemove, result);
            }
            return result;
        }

        private string GetRemoveAppointmentActionFilter(string idUser, string bbdd, int IdRelation)
        {
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetIdFilter("Id", IdRelation) +
                $" }}";
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuation>>> GetRelationsOfAppointmentAsync(
            string idEvent,
            string idUser,
            string env,
            string bbdd,
            int pageSize,
            int pageIndex)
        {
            var result = new Result<PaginatedItemsViewModel<LexActuation>>(new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, 0, new List<LexActuation>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.GetRelationsOfAppointment);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetRelationsApointmentFilter(bbdd, idUser, idEvent);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.SearchAppointmentRelations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, null, null, command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.GetRelationsOfAppointment, nameof(GetRelationsOfAppointmentAsync));

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var rawResult = reader.GetValue(0).ToString();
                                if (!string.IsNullOrEmpty(rawResult))
                                {
                                    var resultado = JsonConvert.DeserializeObject<LexAppointmentActuation>(rawResult);
                                    result.data = new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado.actuaciones);
                        
                                }
                                else
                                {
                                    if (result.infos.Count > 1)
                                        TraceError(result.errors, new LexonDomainException($"MySql get an extrange or empty string with this search"), Codes.LexonActuations.GetRelationsOfAppointment, "MYSQL");
                                    else
                                        TraceInfo(result.infos, "MySql get and empty string with this search", Codes.LexonActuations.GetRelationsOfAppointment);

                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get relations of appointment", ex), Codes.LexonActuations.GetRelationsOfAppointment, "MYSQLCONN");
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
       
            return result;
        }

        private string GetRelationsApointmentFilter(string bbdd, string idUser, string idAppointment)
        {
            return $"{{ " +
                    GetUserFilter(bbdd, idUser) +
                    GetTextFilter("idEvent", idAppointment) +
                    $" }}";
        }
  
        #endregion Appointments

        public async Task<Result<PaginatedItemsViewModel<LexActuationType>>> GetActuationTypesAsync(string env, string idUser, string bbdd)
        {
            var pageIndex = 1;
            var pageSize = 0;
            var result = new Result<PaginatedItemsViewModel<LexActuationType>>(new PaginatedItemsViewModel<LexActuationType>(pageIndex, pageSize, 0, new List<LexActuationType>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.GetActuationTypes);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{ {GetUserFilter(bbdd, idUser)} }}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuationTypes, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.GetActuationTypes, nameof(GetActuationTypesAsync));

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var contador = GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value);
                            if (PossibleHasData(result.errors, contador))
                            {
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuationType[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuationType>(pageIndex, pageSize, contador, resultado);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get thet types of actuations", ex), Codes.LexonActuations.GetActuationTypes, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationTypesMongoAsync(result);
            }

            return result;
        }

        private Task GetActuationTypesMongoAsync(Result<PaginatedItemsViewModel<LexActuationType>> result)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuationCategory>>> GetActuationCategoriesAsync(string env, string idUser, string bbdd)
        {
            var pageIndex = 1;
            var pageSize = 0;
            var result = new Result<PaginatedItemsViewModel<LexActuationCategory>>(new PaginatedItemsViewModel<LexActuationCategory>(pageIndex, pageSize, 0, new List<LexActuationCategory>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.GetActuationCategories);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = $"{{ {GetUserFilter(bbdd,idUser)} }}";
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuationCategories, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(0, 1, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.GetActuationCategories, nameof(GetActuationCategoriesAsync));
                    
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            //if (PossibleHasData(result.errors, result.data.Count))
                            //{
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuationCategory[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuationCategory>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado);
                                }
                            //}
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get thet categories of actuations", ex), Codes.LexonActuations.GetActuationCategories, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }

        private Task GetActuationCategoriesMongoAsync(Result<PaginatedItemsViewModel<LexActuationCategory>> result)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<PaginatedItemsViewModel<LexActuation>>> GetActuationsAsync(
            string idType,
            int? idCategory,
            string idUser,
            string env,
            string bbdd,
            string filter,
            int pageSize,
            int pageIndex)
        {
 
            var result = new Result<PaginatedItemsViewModel<LexActuation>>(new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, 0, new List<LexActuation>()));
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.GetActuations);

            using (MySqlConnection conn = new MySqlConnection(_conn))
            {
                try
                {
                    var filtro = GetActuationSearchFilter(idUser, bbdd, idType, idCategory, filter);
                    conn.Open();
                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.GetActuations, conn))
                    {
                        AddCommonParameters(idUser, command, "P_FILTER", filtro);
                        AddListSearchParameters(pageSize, pageIndex, "ts", "DESC", command);
                        var r = command.ExecuteNonQuery();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.GetActuations, nameof(GetActuationsAsync));
                                          
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            //if (PossibleHasData(result.errors, result.data.Count))
                            //{
                                while (reader.Read())
                                {
                                    var rawJson = reader.GetValue(0).ToString();
                                    var resultado = (JsonConvert.DeserializeObject<LexActuation[]>(rawJson)).ToList();
                                    result.data = new PaginatedItemsViewModel<LexActuation>(pageIndex, pageSize, GetIntOutputParameter(command.Parameters["P_TOTAL_REG"].Value), resultado);
                                }
                            //}
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceError(result.errors, new LexonDomainException($"Error when get actuations", ex), Codes.LexonActuations.GetActuations, "MYSQLCONN");
                }
            }

            if (_settings.Value.UseMongo)
            {
                //await GetActuationCategoriesMongoAsync(result);
            }

            return result;
        }

        private string GetActuationSearchFilter(string idUser, string bbdd, string idType, int? idCategory, string filter)
        {
            //var category = idCategory == 0 ? "" : GetLongFilter("IdCategory", idCategory);
            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetTextFilter("IdType", idType) +
                GetLongFilter("IdCategory", idCategory) +
                GetTextFilter("filter", filter) +
            $" }}";
        }
 
        public async Task<Result<int>> AddActionAsync(LexAction action, string env, string idUser, string bbdd)
        {
            var result = new Result<int>(0);
            ConfigureByEnv(env, result.infos, _settings.Value, out _conn, out _urlLexon, Codes.LexonActuations.AddAction);

            try
            {
                using (MySqlConnection conn = new MySqlConnection(_conn))
                {
                    var filtro = GetAddActionFilter(idUser, bbdd, action);
                    conn.Open();

                    using (MySqlCommand command = new MySqlCommand(_settings.Value.SP.AddAction, conn))
                    {
                        AddCommonParameters(idUser, command, "P_JSON", filtro, true);
                        await command.ExecuteNonQueryAsync();
                        CheckErrorOutParameters(command, result.errors, Codes.LexonActuations.AddAction, nameof(AddActionAsync));
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
                TraceError(result.errors, new LexonDomainException($"Error when add action", ex), Codes.LexonActuations.AddAction, "MYSQLCONN");
            }

            return result;
        }

        private string GetAddActionFilter(string idUser, string bbdd, LexAction action)
        {
            //"relations":[{ "idEntityRelation":8,"idEntityTypeRelation":2},{ "idEntityRelation":7,"idEntityTypeRelation":2}]}';

            return $"{{ " +
                GetUserFilter(bbdd, idUser) +
                GetTextFilter("idType", action.IdType) +
                GetTextFilter("idCategory", action.IdCategory) +
                GetTextFilter("issue", action.Issue) +
                //GetTextFilter("description", action.Description) +
                GetTextFilter("startDateFrom", action.StartDateFrom) +
                GetTextFilter("startDatetTo", action.StartDateTo) +
                //GetTextFilter("last", action.Last) +
                GetTextFilter("billable", action.Billable) +
                //GetTextFilter("idStatus", action.IdStatus) +
                //GetTextFilter("direction", action.Direction) +
                //GetTextFilter("PresentationDate", action.PresentationDate) +
                //GetTextFilter("expirationDate", action.ExpirationDate) +
                //GetTextFilter("economicEstimate", action.EconomicEstimate) +
                GetTextFilter("idAppointment", action.IdAppointment) +
                //GetTextFilter("related", action.Related) +
                //GetTextFilter("contactsRelations", action.ContactsRelations) +
                //GetTextFilter("filesRelation", action.FilesRelation) +
                //GetTextFilter("uid", action.Uid) +
                //GetTextFilter("Public", action.Public) +
                //GetTextFilter("idCompany", action.IdCompany) +
                //GetTextFilter("idRate", action.IdRate) +
                //GetTextFilter("folder_id", action.Folder_id) +
                //GetTextFilter("idLexnet", action.IdLexnet) +
                $" }}";
        }
   
        #endregion Actuations
    }
}